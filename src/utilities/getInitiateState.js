// utils/initialState.js

// Main user state
export const getUserInitialState = (body = {}) => ({
    accessToken: body.accessToken ?? "",
    isLogin: body.isLogin ?? false,
    userName: body.userName ?? "",
    email: body.email ?? "",
    userId: body.userId ?? "",
    wallet: getUserWalletInitialState(body.wallet),
  });
  
  // Wallet state
  export const getUserWalletInitialState = (body = {}) => ({
    balance: body?.balance ?? 0,
    exposure: body?.exposure ?? 0,
    walletId: body?.walletId ?? "",
    profit_loss: body?.profit_loss ?? "",
    marketListExposure: body?.marketListExposure ?? [],
  });
  
  // Bidding state
  export const getUserPlaceBidding = (body = {}) => ({
    gameId: body.gameId ?? "",
    marketId: body.marketId ?? "",
    runnerId: body.runnerId ?? "",
  });
  
  // App initial state (used in context)
  export const getAppInitialState = () => ({
    user: getUserInitialState(),
    announcement: [],
    appDrawer: [],
    isLoading: false,
    placeBidding : getUserPlaceBidding()
  });
  