/**
 * Netatmo reducer
 * NAMain = MAIN module
 * NAModule1 = OUTDOOR module
 * NAModule2 = WIND module
 * NAModule3 = RAIN module
 * NAModule4 = INDOOR module
 */
import { Reducer } from "redux";
import moment from 'moment';
import { INetatmoState, NetatmoActionTypes } from "./types";
import {DataTypes} from "../../types/netatmo";

const initialState: INetatmoState = {
    client_id: '',
    client_secret: '',
    username: '',
    password: '',

    loading_auth: false,
    loading_refresh_token: false,
    auth_errors: undefined,
    access_token: '',
    refresh_token: window.localStorage.getItem('NetatmoRefreshToken') || '',
    access_token_expire_in: 0,

    loading_station_data: true,
    station_data_last_updated: 0,
    station_data_errors: undefined,
    station_data: undefined,
    first_fetch: true,

    selected_indoor_module: 0,

    loading_measure: false,
    measure_errors: undefined,
    measure_data: [],
    selected_module: window.localStorage.getItem('selected_module') || '',
    selected_types: window.localStorage.getItem('selected_types') ? JSON.parse(window.localStorage.getItem('selected_types') as string) : ['Temperature'],
    selected_timelapse: window.localStorage.getItem('selected_timelapse') as '12h'|'1d'|'1m' || '12h',

    loading_rain_measure: false,
    measure_rain_errors: undefined,
    measure_rain_data: [],

    loading_indoor_measure: false,
    measure_indoor_errors: undefined,
    measure_indoor_data: [],
    selected_indoor_type: window.localStorage.getItem('selected_indoor_type') as DataTypes || 'Temperature',

    loading_indoor_second_measure: false,
    measure_indoor_second_errors: undefined,
    measure_indoor_second_data: [],
    selected_indoor_second_type: window.localStorage.getItem('selected_indoor_second_type') as DataTypes || 'Temperature',

    loading_indoor_third_measure: false,
    measure_indoor_third_errors: undefined,
    measure_indoor_third_data: [],
    selected_indoor_third_type: window.localStorage.getItem('selected_indoor_third_type') as DataTypes || 'Temperature',

    loading_outdoor_measure: false,
    measure_outdoor_errors: undefined,
    measure_outdoor_data: [],
    selected_outdoor_type: window.localStorage.getItem('selected_outdoor_type') as DataTypes || 'Temperature',

    loading_station_measure: false,
    measure_station_errors: undefined,
    measure_station_data: [],
    selected_station_type: window.localStorage.getItem('selected_station_type') as DataTypes || 'Temperature',
};

const reducer: Reducer<INetatmoState> = (state = initialState, action) => {
    if (typeof state === 'undefined') {
        // No preloadedState from server. Use local state.
        state = { ...initialState }
    } else {
        // PreloadedState supplied by the server, but it's not merged with our local initial state yet.
        state = { ...initialState, ...state }
    }

    switch (action.type) {
        /** NETATMO AUTH **/
        case NetatmoActionTypes.AUTH_REQUEST:
            return { ...state, loading_auth: true };

        case NetatmoActionTypes.AUTH_SUCCESS:
            return { ...state,
                loading_auth: false,
                auth_errors: undefined,
                access_token: action.payload.access_token,
                refresh_token: action.payload.refresh_token,
                access_token_expire_in: moment().unix() + action.payload.expire_in
            };

        case NetatmoActionTypes.AUTH_FAILURE:
            return { ...state, loading_auth: false, auth_errors: action.error };

        /** NETATMO REFRESH TOKEN **/
        case NetatmoActionTypes.REFRESH_TOKEN_REQUEST:
            return { ...state, loading_auth: true };

        case NetatmoActionTypes.REFRESH_TOKEN_SUCCESS:
            return { ...state,
                loading_auth: false,
                auth_errors: undefined,
                access_token: action.payload.access_token,
                refresh_token: action.payload.refresh_token,
                access_token_expire_in: moment().unix() + action.payload.expire_in
            };

        case NetatmoActionTypes.REFRESH_TOKEN_FAILURE:
            return { ...state, loading_auth: false, auth_errors: action.error };

        /** NETATMO STATION DATA **/
        case NetatmoActionTypes.STATION_DATA_REQUEST:
            return { ...state, loading_station_data: true };

        case NetatmoActionTypes.STATION_DATA_SUCCESS:
            return { ...state,
                loading_station_data: false,
                station_data: action.payload,
                station_data_last_updated: action.receivedAt,
                station_data_errors: undefined,
                first_fetch: false,
                selected_module: state.selected_module || action.payload.modules.OUTDOOR.id
            };

        case NetatmoActionTypes.STATION_DATA_FAILURE:
            return { ...state, loading_station_data: false, station_data_errors: action.error };

        /** NETATMO MEASURE DATA **/
        case NetatmoActionTypes.MEASURE_REQUEST:
            return { ...state, loading_measure: true };

        case NetatmoActionTypes.MEASURE_SUCCESS:
            // Store in localStorage selected module, types and timelapse
            window.localStorage.setItem('selected_module', action.module);
            window.localStorage.setItem('selected_types', JSON.stringify(action.types));
            window.localStorage.setItem('selected_timelapse', action.timelapse);

            return { ...state,
                loading_measure: false,
                measure_data: action.payload,
                selected_module: action.module,
                selected_types: action.types,
                selected_timelapse: action.timelapse,
                measure_errors: undefined
            };

        case NetatmoActionTypes.MEASURE_FAILURE:
            return { ...state, loading_measure: false, measure_errors: action.error };

        /** NETATMO MEASURE RAIN DATA **/
        case NetatmoActionTypes.MEASURE_RAIN_REQUEST:
            return { ...state, loading_rain_measure: true };

        case NetatmoActionTypes.MEASURE_RAIN_SUCCESS:
            return { ...state,
                loading_rain_measure: false,
                measure_rain_data: action.payload,
                measure_rain_errors: undefined
            };

        case NetatmoActionTypes.MEASURE_RAIN_FAILURE:
            return { ...state, loading_rain_measure: false, measure_rain_errors: action.error };

        /** NETATMO MEASURE DATA **/
        case NetatmoActionTypes.MEASURES_REQUEST:
            switch (action.module) {
                case 'indoor':
                    return { ...state, loading_indoor_measure: true };
                case 'indoor_second':
                    return { ...state, loading_indoor_second_measure: true };
                case 'indoor_third':
                    return { ...state, loading_indoor_third_measure: true };
                case 'outdoor':
                    return { ...state, loading_outdoor_measure: true };
                case 'station':
                    return { ...state, loading_station_measure: true };
                default:
                    return state;
            }

        case NetatmoActionTypes.MEASURES_SUCCESS:
            switch (action.module) {
                case 'indoor':
                    return { ...state,
                        loading_indoor_measure: false,
                        measure_indoor_data: action.payload,
                        measure_indoor_errors: undefined
                    };
                case 'indoor_second':
                    return { ...state,
                        loading_indoor_second_measure: false,
                        measure_indoor_second_data: action.payload,
                        measure_indoor_second_errors: undefined
                    };
                case 'indoor_third':
                    return { ...state,
                        loading_indoor_third_measure: false,
                        measure_indoor_third_data: action.payload,
                        measure_indoor_third_errors: undefined
                    };
                case 'outdoor':
                    return { ...state,
                        loading_outdoor_measure: false,
                        measure_outdoor_data: action.payload,
                        measure_outdoor_errors: undefined
                    };
                case 'station':
                    return { ...state,
                        loading_station_measure: false,
                        measure_station_data: action.payload,
                        measure_station_errors: undefined
                    };
                default:
                    return state;
            }

        case NetatmoActionTypes.MEASURES_FAILURE:
            switch (action.module) {
                case 'indoor':
                    return { ...state, loading_indoor_measure: false, measure_indoor_errors: action.error };
                case 'indoor_second':
                    return { ...state, loading_indoor_second_measure: false, measure_indoor_second_errors: action.error };
                case 'indoor_third':
                    return { ...state, loading_indoor_third_measure: false, measure_indoor_third_errors: action.error };
                case 'outdoor':
                    return { ...state, loading_outdoor_measure: false, measure_outdoor_errors: action.error };
                case 'station':
                    return { ...state, loading_station_measure: false, measure_station_errors: action.error };
                default:
                    return state;
            }

        case NetatmoActionTypes.CHANGE_SELECTED_TYPE:
            switch (action.module) {
                case 'indoor':
                    window.localStorage.setItem('selected_indoor_type', action.payload);
                    return { ...state, selected_indoor_type: action.payload };
                case 'indoor_second':
                    window.localStorage.setItem('selected_indoor_second_type', action.payload);
                    return { ...state, selected_indoor_second_type: action.payload };
                case 'indoor_third':
                    window.localStorage.setItem('selected_indoor_third_type', action.payload);
                    return { ...state, selected_indoor_third_type: action.payload };
                case 'outdoor':
                    window.localStorage.setItem('selected_outdoor_type', action.payload);
                    return { ...state, selected_outdoor_type: action.payload };
                case 'station':
                    window.localStorage.setItem('selected_station_type', action.payload);
                    return { ...state, selected_station_type: action.payload };
                default:
                    return state;
            }

        case NetatmoActionTypes.CHANGE_SELECTED_INSIDE_MODULE:
            return { ...state, selected_indoor_module: action.payload };

        default:
            return state;
    }
};

export {reducer as netatmoReducer}
