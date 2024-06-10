import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <div className="navbar">
            <ul>
                <li><NavLink exact="true" to="/">Главная</NavLink></li>
                <li><NavLink to="/fileprocessing">Файлы</NavLink></li>
                {/* <li><NavLink to="/commands">Команды</NavLink></li> */}
            </ul>
        </div>
    )
}

export default Navbar;