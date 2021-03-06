import { CacheService } from "@app/cache";
import { util } from "@app/helpers";
import mongoose, {
  CreateQuery,
  Document,
  FilterQuery,
  UpdateQuery,
} from "mongoose";

export interface Settings<Model> {
  namespace: string;
  linkingKeys?: Array<keyof Model>;
  autoPopulate?: Array<keyof Model>;
}

export interface ConfigurationInterface<Model> {
  Create: Partial<Model>;
  Query: Partial<Model>;
  Update: Partial<Omit<Model, "_id">>;
}

/**
 * Abstraction to manipulate the cached and persistent data of a single record, respectively.
 */
export class RepositoryFactory<
  Model,
  ModelDocument extends Document,
  Insert,
  Query,
  Update,
> {
  constructor(
    private cache: CacheService,
    public mongooseModel: mongoose.Model<ModelDocument>,
    private settings: Settings<Model>,
  ) {}

  /**
   * Get a record from the cache, if it doesn't exist, get from persistent and update the cache
   * @param query
   * @returns
   * @constructs {Model}
   */
  async find(query: Query): Promise<Model | null> {
    const cache = await this.cache.get(this.settings.namespace, query);
    if (cache) {
      return cache;
    }

    // const data = await this.persistenceLayer.makeQuery(query);
    const data = await this.makeFindOneQuery(query);
    if (!data) {
      return null;
    }

    this.setCache(data);

    return data as unknown as Model;
  }

  /**
   * Execute autopopulate on query
   * @param query
   */
  private async makeFindOneQuery(query: Query) {
    const obj = this.mongooseModel.findOne(
      query as mongoose.FilterQuery<ModelDocument>,
    );
    return this.populateObject(obj);
  }

  /**
   * Do auto populate on configured fields
   * @param query
   */
  private populateObject(
    query: mongoose.Query<
      mongoose.EnforceDocument<ModelDocument, {}> | null,
      mongoose.EnforceDocument<ModelDocument, {}>
    >,
  ) {
    this.settings.autoPopulate?.forEach((prop) => {
      query.populate(prop as string);
    });

    return query;
  }

  /**
   * Saves cache with configured linking keys
   * @param data
   */
  private async setCache(data: any): Promise<void> {
    const promise = this.cache.set(
      this.settings.namespace,
      { _id: data._id }, // using the doc._id to prevent a circular reference on linking keys
      data,
      {
        link: this.mountLinkingKeys(data),
      },
    );
    util.handleRejectionByUnderHood(promise);
  }

  async cacheObject(_id: string) {
    const fromPersistent = await this.makeFindOneQuery({
      _id,
    } as unknown as Query);

    if (!fromPersistent) {
      // TODO: should throw or warn log
      return;
    }

    if (this.settings.autoPopulate) {
      for (const prop of this.settings.autoPopulate) {
        fromPersistent?.populate(prop as string);
      }

      await fromPersistent?.execPopulate();
    }

    this.setCache(fromPersistent.toJSON());
  }

  /**
   * Updates a record in persistent storage and cache
   * @param query
   * @param data
   */
  async updateByQuery(query: Query, data: Update) {
    await this.mongooseModel.updateOne(
      query as FilterQuery<ModelDocument>,
      data as unknown as UpdateQuery<ModelDocument>,
    );
    this.updateCache(query);
  }

  /**
   * Creates a item in persistent storage and cache it
   * @param data
   * @param options.cache Cache after created
   * @default true
   * @returns Lean document
   */
  public async insert(data: Insert, options = { cache: true }): Promise<Model> {
    const modelResultInsertQuery = await this.mongooseModel.create(
      data as CreateQuery<ModelDocument>,
    );

    if (options.cache) {
      this.setCache(modelResultInsertQuery);
    }

    return modelResultInsertQuery.toJSON<Model>();
  }

  /**
   * Updates cache with data from persistent storage
   * @param query
   */
  async updateCache(query: Query) {
    const data = await this.makeFindOneQuery(query);

    if (!data) return;

    this.setCache(data);
  }

  /**
   * * CAUTION!
   * * Remove record from PERSISTENT storage and cache.
   * @param query
   * @returns {Promise<void>}
   */
  async remove(query: any): Promise<void> {
    await this.mongooseModel.deleteOne(query);
    await this.cache.del(this.settings.namespace, query);
  }

  /**
   * Mounts the list of linking keys of cache
   * @param data
   */
  private mountLinkingKeys(data: any): string[] | undefined {
    if (!this.settings.linkingKeys) {
      return;
    }

    const clean = this.settings.linkingKeys.filter(
      (key) => !this.isEmpty(data[key]),
    );

    return clean.reduce<string[]>((final, key) => {
      const value = data[key];

      /**
       * Creates a link key to each value of array
       * to work according to "least one"
       * approach of mongo querying array field
       */
      if (Array.isArray(value)) {
        return [
          ...final,
          ...value.map((value) => JSON.stringify({ [key]: value })),
        ];
      }

      return [...final, JSON.stringify({ [key]: value })];
    }, []);
  }

  /**
   * Helper method to check empty objects of cache linking keys
   * @param value
   */
  public isEmpty(value: any) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (value instanceof Object) {
      return Object.keys(value).length === 0;
    }

    return !value;
  }
}
