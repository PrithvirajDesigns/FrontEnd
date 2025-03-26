import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'
import MainRouters from './Routers/MainRouters.jsx'

createRoot(document.getElementById('root')).render(
<BrowserRouter>
      <MainRouters/>
  </BrowserRouter>    
)