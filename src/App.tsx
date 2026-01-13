import './App.sass'
import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App(): ReactElement {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<h1>App</h1>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
