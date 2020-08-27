import React from 'react'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import HowRichAmI, { HowRichAmIStandalone } from 'components/HowRichAmI'

const Router = () => <BrowserRouter>
  <Route path='/' exact render={({ location }) => <Redirect to={{ pathname: '/how-rich-am-i', search: location.search }} />} />
  <Route path='/how-rich-am-i' component={HowRichAmIStandalone} />
  <Route path='/embed' component={HowRichAmI} />
</BrowserRouter>

export default Router
