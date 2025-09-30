import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socketService';

const AuthContext = createContext();

const AUTH_ACTIONS = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  SET_USER: 'SET_USER',
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  useEffect(() => {
    const token = authAPI.getToken();
    const user = authAPI.getCurrentUser();

    if (token && user) {
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { user, token },
      });
      // Connect to socket
      socketService.connect(token);
    } else {
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { user: null, token: null },
      });
    }
  }, []);

  const login = async (data) => {
    dispatch({ type: AUTH_ACTIONS.LOADING });
    
    try {
      let user, token;

      if (data.user && data.token) {
        user = data.user;
        token = data.token;
      } else {
        const response = await authAPI.verifyCode(data);
        user = response.data.user;
        token = response.data.accessToken;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      socketService.connect(token);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOADING });
    
    try {
      const response = await authAPI.signup(userData);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: { user, token },
      });

      socketService.connect(token);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };
  const logout = () => {
    authAPI.logout();
    socketService.disconnect();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const setUser = (user, token = null) => {
    const authToken = token || authAPI.getToken();
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user, token: authToken },
    });
    
    // Connect to socket if token exists
    if (authToken) {
      socketService.connect(authToken);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: state.user, token: state.token },
    });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    setUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;