import React from 'react'

import { Route, Routes } from 'react-router-dom'
import Bookt from '../User/Pages/Booktracker/bookt'
import Diary from '../User/Pages/Diary/diary'
import Task from '../User/Pages/Task/task'
import Pomodoro from '../User/Pages/Pomodoro/pomodoro'
import Home from '../User/Pages/Home/home'
import Report from '../User/Pages/Report/report'
import Settings from '../User/Pages/Settings/settings'
import Hero from '../User/Pages/Hero/hero'

const UserRouter = () => {
  return (
    <div>
         <Routes>
          <Route path='/booktracker' element={<Bookt/>} />
          <Route path='/diary' element={<Diary/>} />
          <Route path='/report' element={<Report/>} />
          <Route path='/task' element={<Task/>} />
          <Route path='/pomodoro' element={<Pomodoro/>} />
          <Route path='/settings' element={<Settings/>} />
          <Route path='/' element={<Hero/>} />
          
      </Routes>
    </div>
  )
}

export default UserRouter