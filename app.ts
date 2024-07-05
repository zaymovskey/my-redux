interface IAction {
  type: string
  payload?: any
}

type TypeReducer<ReducerScheme = any> = (state: ReducerScheme, action: IAction) => ReducerScheme

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

function createStore<T = any>(reducer: TypeReducer) {
  let state: T = reducer({}, { type: 'INIT' });
  let subscribers: Array<() => void> = []

  return {
    getState: () => state,
    dispatch: (action: IAction) => {
      state = reducer(state, action)
      subscribers.forEach(subscriber => {
        subscriber();
      })
    },
    subscribe: (cb: () => void) => subscribers.push(cb)
  }
}

function combineReducers<T>(reducers: {[key in keyof T]: TypeReducer}):
  (state: T, action: IAction) => {[key in keyof T]: ReturnType<TypeReducer>} {
  return (state: T, action: IAction) => {
    const nextState: T = {} as T;
    Object.entries<TypeReducer>(reducers).map(
      ([reducerName, reducer]) => nextState[reducerName] = reducer(state, action)
    )
    return nextState
  }
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

store.subscribe(() => {console.log('change')})

console.log(store.getState())

store.dispatch(getIncrementAction(3))

console.log(store.getState())

store.dispatch(getToggleUserActivateAction())

console.log(store.getState())
