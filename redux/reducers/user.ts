import {
  SIGNUP_USER_REQUEST,
  SIGNUP_USER_SUCCESS,
  SIGNUP_USER_FAILURE,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAILURE,
  LOG_OUT,
  FORGOT_PASS_REQUEST,
  FORGOT_PASS_FAILURE,
  FORGOT_PASS_SUCCESS,
  RESET_PASS_REQUEST,
  RESET_PASS_FAILURE,
  RESET_PASS_SUCCESS,
  USER_PROFILE
} from '../actions';
import { HYDRATE } from 'next-redux-wrapper';
import {
  CreateUserType,
  LoginUserType,
  UserProfile,
  ForgotPasswordForm,
  ResetPasswordForm
} from '@type/Users';

export type UserReducerState = {
  token: string | null;
  profile: UserProfile | null;
  error: string | null;
  loading: boolean;
};

export type CreateUserReducerAction = {
  payload: CreateUserType;
  type: string;
};

export type LoginUserReducerAction = {
  payload: LoginUserType;
  type: string;
};

export type ForgotResetPassReducerAction = {
  payload: ForgotPasswordForm;
  type: string;
};

export type ResetPassReducerAction = {
  payload: ResetPasswordForm;
  type: string;
};

export type UserStateAction = {
  payload?: {
    user: UserProfile;
    jwt: string;
  };
  error?: string;
  loading?: boolean;
  type: string;
};

const initialState: UserReducerState = {
  error: null,
  profile: null,
  token: null,
  loading: false
};

export function userReducer(state = initialState, action: UserStateAction) {
  switch (action.type) {
    case HYDRATE: {
      return { ...state, ...action.payload };
    }
    case SIGNUP_USER_REQUEST:
      return {
        ...state,
        ...{ loading: true, error: null }
      };
    case SIGNUP_USER_SUCCESS:
      if (action.payload !== undefined) {
        const { jwt, user } = action.payload;
        if (jwt) {
          localStorage.setItem('token', jwt);
          return {
            ...state,
            ...{ profile: user, token: jwt, loading: false }
          };
        }
        return state;
      }
      return state;
    case SIGNUP_USER_FAILURE:
      return {
        ...state,
        ...{ error: action.error, loading: false }
      };
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        ...{ loading: true, error: null, token: null, profile: null }
      };
    case LOGIN_USER_SUCCESS:
      if (action.payload !== undefined) {
        const { jwt, user } = action.payload;
        if (jwt) {
          localStorage.setItem('token', jwt);
          return {
            ...state,
            ...{ profile: user, token: jwt, loading: false }
          };
        }
        return state;
      }
      return state;
    case LOGIN_USER_FAILURE:
      return {
        ...state,
        ...{ error: action.error, loading: false }
      };
    case FORGOT_PASS_REQUEST:
      return {
        ...state,
        ...{ loading: true, error: null, message: null }
      };
    case FORGOT_PASS_SUCCESS:
      return {
        ...state,
        ...{ loading: false, error: null }
      };
    case FORGOT_PASS_FAILURE:
      return {
        ...state,
        ...{ error: action.error, loading: false, message: null }
      };
    case RESET_PASS_REQUEST:
      return {
        ...state,
        ...{ loading: true, error: null }
      };
    case RESET_PASS_SUCCESS:
      return {
        ...state,
        ...{ loading: false, error: null }
      };
    case RESET_PASS_FAILURE:
      return {
        ...state,
        ...{ error: action.error, loading: false, message: null }
      };

    case USER_PROFILE:
      return {
        ...state,
        ...{ profile: action.payload }
      };

    case LOG_OUT:
      localStorage.removeItem('token');
      window.location.href = '/';
      return {
        ...state,
        ...{ loading: false, error: null, token: null, profile: null }
      };

    default:
      return state;
  }
}
