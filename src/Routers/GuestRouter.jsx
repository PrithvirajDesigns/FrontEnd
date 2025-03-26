import React from 'react'
import { Routes } from 'react-router-dom'

const GuestRouter = () => {
  return (
    <div>
        <Routes>
            <Route path='Login' element={<Login/>} />
            <Route path='Reg' element={<Reg/>} />
        </Routes>
    </div>
  )
}

export default GuestRouter