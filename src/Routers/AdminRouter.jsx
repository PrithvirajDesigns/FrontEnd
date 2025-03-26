import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Adminreg from '../Admin/Pages/AdminReg/adminreg'
import Bookadd from '../Admin/Pages/Bookadd/bookadd'
import Priority from '../Admin/Pages/Priority/priority'
import Repeating from '../Admin/Pages/Repeating/repeating'
import Status from '../Admin/Pages/Status/Status'

const AdminRouter = () => {
  return (
    <div>
      <Routes>
        <Route path='Adminreg' element={<Adminreg/>} />
        <Route path='Bookadd' element={<Bookadd/>} />
        <Route path='Priority' element={<Priority/>} />
        <Route path='Repeating' element={<Repeating/>} />
        <Route path='Status' element={<Status/>} />
      </Routes>
    </div>
  )
}

export default AdminRouter