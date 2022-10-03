export default (
  state = {
    phoneStream: null,
    phoneStreamLoading: true,
  },
  action
) => {
  switch (action.type) {
    case "ADD_STREAM":
      return {
        ...state,
        phoneStream: action.payload,
        phoneStreamLoading: false,
      };
    default:
      return state;
  }
};
