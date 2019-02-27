import {Component, useContext, useReducer, useEffect} from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import * as GitHub from '../../../github-client'


//RE-WRITE
//1. functionize
function QueryFn({query, variables, children, normalize = data => data}){
  const client = useContext(GitHub.Context)

  //useReducer hook to mock a state in Class component
  const [state, setState] = useReducer(

    //a fn on state/setState
    (state, setState) => ({...state, ...newState}),

    //the initial state object
    {loaded: false, fetching: false, data: null, error: null }
  )

  //replaces the componentDidMount query call
  useEffect(() => {
    setState({fetching: true})
//    const client = context
  
    client
      .request(query, variables)
      .then(res =>
        setState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })
}

//2. add propTypes to fn
QueryFn.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}





//STARTING
class Query extends Component {
  static propTypes = {
    query: PropTypes.string.isRequired,
    variables: PropTypes.object,
    children: PropTypes.func.isRequired,
    normalize: PropTypes.func,
  }
  static defaultProps = {
    normalize: data => data,
  }
  static contextType = GitHub.Context

  state = {loaded: false, fetching: false, data: null, error: null}

  componentDidMount() {
    this._isMounted = true
    this.query()
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(this.props.query, prevProps.query) ||
      !isEqual(this.props.variables, prevProps.variables)
    ) {
      this.query()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  query() {
    this.setState({fetching: true})
    const client = this.context
    client
      .request(this.props.query, this.props.variables)
      .then(res =>
        this.safeSetState({
          data: this.props.normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        this.safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  }

  safeSetState(...args) {
    this._isMounted && this.setState(...args)
  }

  render() {
    return this.props.children(this.state)
  }
}

export default Query
