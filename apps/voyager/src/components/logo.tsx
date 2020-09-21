import React, { FC } from "react";
import { View, ViewProps } from "react-native";
import { observer } from "mobx-react-lite";
import Svg, { Path } from "react-native-svg";
import { UIStore } from "@stores";

const Logo: FC<Partial<ViewProps>> = observer((props) => {
  const { onBackground } = UIStore.theme.colors;
  return (
    <View {...props}>
      <Svg width="38" height="39" viewBox="0 0 59 60" fill="none">
        <Path
          d="M11.6095 2.32629L10.856 2.96282C11.5997 2.33438 7.42726 4.14686 12.5835 6.63498C13.661 7.14219 14.8028 7.49972 15.9772 7.69765C18.551 7.96332 17.5638 8.09616 18.9299 7.28499C20.3415 6.44685 20.44 6.47585 22.3013 7.00685C24.5976 7.66225 24.2079 7.64742 25.5679 7.02472C27.2941 6.23277 26.9839 6.30795 28.376 6.65386C29.3404 6.87918 30.3263 7.00012 31.3165 7.0146C30.8523 7.03314 43.2649 8.55029 44.1748 8.59917C45.4526 8.66997 46.8406 8.98959 48.4508 8.48691C50.1773 7.94748 51.7973 6.22569 50.8755 4.77226C50.6122 4.3569 50.3483 3.98301 50.3483 3.98301L50.5981 3.29726C50.8985 2.47328 50.8813 2.79458 50.65 2.33303L50.3466 1.7309C50.3466 1.7309 50.3128 2.0414 50.2791 2.3273C50.2093 2.95439 50.3853 2.63478 49.6962 3.53023C49.0836 4.32589 49.175 3.98908 49.5276 4.70113C49.6561 4.96931 49.7707 5.24388 49.8712 5.52376L48.6265 5.80594C46.8005 6.21996 47.3379 6.10634 44.6482 5.69165C43.0973 5.45228 41.4332 5.16807 41.4332 5.16807L38.0331 4.44355C35.6973 4.02959 33.33 3.8182 30.9578 3.81174L27.6511 3.8667C27.6511 3.8667 25.105 4.07606 23.89 3.50393C21.3135 2.29258 18.4026 2.34787 15.6077 3.92098C14.6269 4.47288 13.6297 5.17077 13.6297 5.17077L12.388 4.62898C11.5087 4.24531 11.7983 4.52783 11.5198 3.78612C11.3229 3.26254 11.326 3.59968 11.5101 2.77469L11.6095 2.32629Z"
          fill={onBackground}
        />
        <Path
          d="M20.1652 11.9268C21.3912 12.3008 22.5836 12.7772 23.7298 13.3509C24.3972 13.725 24.9991 14.2055 25.5119 14.7733C25.5119 14.7733 26.2469 14.2868 27.9552 14.07C29.5128 13.8724 31.8998 13.9769 34.8666 13.3424C35.7987 13.1169 36.6663 12.6798 37.4023 12.065C38.3274 11.4163 39.295 10.7434 39.295 10.7434L36.0514 11.7326C33.974 12.2272 31.8483 12.4912 29.7131 12.5198C28.4133 12.5193 27.1146 12.4473 25.8228 12.304C24.9867 12.1692 23.426 12.0229 22.6199 12.0006L20.1652 11.9268Z"
          fill={onBackground}
        />
        <Path
          d="M0.283306 12.2535C0.923202 8.36115 0.551671 8.36991 2.03139 5.05714C2.50612 3.94287 3.07103 2.86922 3.72047 1.84687L4.60716 0.785206L5.00667 2.49317C5.37753 4.07404 5.05522 4.00728 6.91793 5.6286L11.9751 10.0303L21.3942 17.3076C24.5161 19.7195 24.2912 19.2185 26.4466 19.6143L27.1842 19.7492L31.5809 19.9852L33.4821 19.8665L37.0467 18.0884L41.5624 14.7696L46.0777 11.3307L50.9494 7.41984L52.9942 5.17616C54.2652 3.78173 54.5815 2.98102 54.7726 1.48478C54.8724 0.708 54.9628 0 54.9628 0C56.0476 0.769005 56.8631 1.85961 57.2941 3.11756C57.7255 4.46307 58.0708 5.83463 58.3281 7.22396C58.4455 7.84565 57.1185 5.04332 57.1889 5.57837C57.2594 6.11341 58.7263 9.97775 58.7438 10.3631C58.7469 10.4285 58.7492 10.4912 58.7506 10.5512C58.7799 11.8324 59.2199 13.0009 58.8854 14.9172C57.2688 24.2244 58.3558 21.1726 56.9856 24.2743C56.6148 25.1171 55.9236 27.4006 55.4914 28.38C53.8444 31.9272 51.9815 35.37 49.9131 38.6892C49.8018 38.8706 50.857 32.9372 50.6406 33.3529C50.4282 33.7615 48.9444 40.5189 48.8305 40.6989C47.9202 42.1321 46.9408 43.5838 45.9041 44.9907C45.1856 45.9651 44.1671 47.6417 43.4999 48.5486C43.3722 48.7225 43.7022 45.7193 43.7117 43.2521C43.7208 40.4231 43.386 35.6589 43.1628 35.7372C42.9912 35.7972 43.2238 40.1696 43.1314 42.9271C43.0364 45.7806 42.6173 49.3847 42.4885 49.56C40.0611 52.864 38.1215 55.5831 38.198 55.4779C36.8835 57.2806 35.4085 59.3372 35.4085 59.3372C33.5418 58.7376 31.6407 58.2508 29.7155 57.8793C29.315 57.8062 28.6481 57.9909 28.0854 57.731C27.8282 57.612 26.7392 54.4843 26.3876 51.6668C26.0626 49.0604 26.4725 46.7445 26.2662 46.694C26.0804 46.6481 25.9318 49.1157 26.1448 51.6668C26.3721 54.3869 26.9634 57.2017 26.8002 57.1582C23.8334 56.3679 23.5424 55.9155 20.6373 53.2834C18.4833 51.332 15.9372 48.3557 15.0849 46.9155C14.9962 46.7658 10.7603 39.6918 6.78274 33.1462C6.6789 32.9756 6.57551 32.8039 6.47257 32.6311C6.0977 31.3179 5.82314 29.9782 5.65129 28.6234C5.49485 27.4192 5.59836 26.4371 5.52992 26.3191C5.43855 26.1613 5.1503 27.2209 5.16614 28.381C5.183 29.619 5.50328 30.9632 5.40888 30.7933C3.56648 27.4616 2.15846 23.9076 1.21921 20.2181C1.00075 19.4966 0.814305 18.88 0.658208 18.3389C0.594826 18.1191 0.62618 14.307 0.572574 14.1098C0.521328 13.9213 0.384786 17.3463 0.342306 17.1744C-0.0953053 15.402 -0.0737282 14.4274 0.283306 12.2535Z"
          fill={onBackground}
        />
      </Svg>
    </View>
  );
});

export default Logo;
