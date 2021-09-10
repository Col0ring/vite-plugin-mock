import React, { useEffect, useState } from 'react'
import './App.css'
function App() {
  const [message, setMessage] = useState('initial message')
  const [user, setUser] = useState({
    username: 'initial username',
    email: 'initial email'
  })
  useEffect(() => {
    fetch('/mock/hello')
      .then((res) => res.json())
      .then((res) => {
        setMessage(res.data)
      })
    fetch('/mock/user/getUserInfo')
      .then((res) => res.json())
      .then((res) => {
        setUser(res.data)
      })
  }, [])
  return (
    <div className="App">
      {message}
      <p>username:{user.username}</p>
      <p>email:{user.email}</p>
    </div>
  )
}

export default App
