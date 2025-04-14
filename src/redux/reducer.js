import { getUserInitialState, getUserPlaceBidding, getUserWalletInitialState } from "../utilities/getInitiateState";
import strings from "../utilities/stringConstant";


export const reducer = (state, action) => {
  switch (action.type) {
    case strings.LOG_IN:
      return {
        ...state,
        user: getUserInitialState({ ...action.payload, isLogin: true }),
      };
      
    case strings.LOG_OUT:
      return {
        ...state,
        user: getUserInitialState({ isLogin: false }),
      };

    case strings.UPDATE_NAME:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case strings.UPDATE_ANNOUNCEMENT:
      return {
        ...state,
        announcement: action.payload,
      };

    case strings.UPDATE_USER_WALLET:
      return {
        ...state,
        user: {
          ...state.user,
          wallet: getUserWalletInitialState(action.payload),
        },
      };

    case strings.UPDATE_PLACE_BIDDING:
      return {
        ...state,
        placeBidding: getUserPlaceBidding(action.payload),
      };

    case strings.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};