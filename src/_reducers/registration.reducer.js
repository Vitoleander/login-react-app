import { userConstants} from '../_constants';

export function registration(state = {}, action) {
    switch (action.type) {
        case userConstants.REGISTER_REQUEST:
            return { registering: true };
        case userConstants.REGISTER_SUCCESS:
            return {};
        case userConstants.REGISSTER_FAILURE:
            return {};
        default:
            return state
    }
}