export interface IAction {
  type: string;
  payload?: any;
}

export type TypeReducer<ReducerScheme = { [key in string]: any }> = (
  state: ReducerScheme,
  action: IAction,
) => ReducerScheme;

export function createStore<T = { [key in string]: any }>(
  reducer: TypeReducer<T>,
) {
  let state: T = reducer({} as T, { type: "INIT" });
  let subscribers: Array<() => void> = [];

  return {
    getState: () => state,
    dispatch: (action: IAction) => {
      state = reducer(state, action);
      subscribers.forEach((subscriber) => {
        subscriber();
      });
    },
    subscribe: (cb: () => void) => subscribers.push(cb),
  };
}

export function combineReducers<
  T extends { [key in string]: any },
>(reducersMapper: {
  [key in keyof T]: TypeReducer<T[key]>;
}): (state: T, action: IAction) => T {
  return (state: T, action: IAction) => {
    let nextState: T = {} as T;
    Object.entries(reducersMapper).forEach(
      ([reducerName, reducer]) =>
        ((nextState as { [key in string]: any })[reducerName] = reducer(
          state[reducerName],
          action,
        )),
    );
    return nextState;
  };
}



interface ICountReducerScheme {
  count: number
}

interface IUserReducerScheme {
  name: string,
  isActivated: boolean
}

interface IStateScheme {
  user: IUserReducerScheme
  count: ICountReducerScheme
}

const countInitialState: ICountReducerScheme = {
  count: 0
}

const countReducer: TypeReducer<ICountReducerScheme> = (state = countInitialState, action: IAction) =>  {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + action.payload
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - action.payload
      }

    default:
      return {...state}
  }
}

const userInitialState: IUserReducerScheme = {
  name: '',
  isActivated: false,
}

const userReducer: TypeReducer<IUserReducerScheme> =
  (state = userInitialState, action: IAction) => {
      switch (action.type) {
        case 'TOGGLE_ACTIVATE':
          return {
            ...state,
            isActivated: !state.isActivated
          }
        default:
          return {...state}
      }
  }


const rootReducer = combineReducers<IStateScheme>({user: userReducer, count: countReducer});

const store = createStore<IStateScheme>(rootReducer);



const getIncrementAction = (payload: number): IAction => (
  {type: 'INCREMENT', payload: payload}
)

const getToggleUserActivateAction = (): IAction => (
  {type: 'TOGGLE_ACTIVATE'}
)

console.log(store.getState())

store.dispatch(getIncrementAction(3))

console.log(store.getState())







