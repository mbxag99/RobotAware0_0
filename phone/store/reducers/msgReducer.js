export default (
  state = {
    msg: null,
    connected: false,
    isLoading: true,
  },
  action
) => {
  switch (action.type) {
    case "MSG_RECIEVED":
      return { ...state, msg: action.payload, isLoading: false };
    case "CONNECTION_INITIATED":
      return { ...state, connected: true, isLoading: false };
    default:
      return state;
  }
};
