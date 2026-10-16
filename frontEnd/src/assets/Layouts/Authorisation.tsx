import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import RouteFallback from './RouteFallback'

const Authorisation = () => {
  return (
    <div>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default Authorisation