import React from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <>
    {/*Header*/}
    <Header />
    {/*Main Content*/}
    <main>
      <Outlet />
    </main>
    {/*Main Content*/}
    {/*Footer*/}
    <Footer />
    
    </>
  )
}

export default UserLayout
