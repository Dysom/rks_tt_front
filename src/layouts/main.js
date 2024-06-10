import Navbar from '../components/navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from '../components/home/Home'
import Fileprocessing from '../components/fileprocessing/Fileprocessing'
import TestPage from '../components/testPage/TestPage'

function Main() {

    return (
        <div className='main'>

            <Navbar></Navbar>
            <div className="content">

                <Routes>

                    <Route exact="true" path="/" element={<Home />} />
                    <Route path="/fileprocessing" element={<Fileprocessing />} />
                    <Route path="/test_page" element={<TestPage />} />

                </Routes>

            </div>

        </div>
    )
}

export default Main;