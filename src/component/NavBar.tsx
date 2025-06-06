import { NavLink } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='flex justify-center bg-[#212529] py-1 text-[#FFFFFF8C] *:p-3 *:pl-0 font-bold md:px-20 lg:px-40 xl:px-80'>
      <NavLink 
        to="/health-declaration"
        className={({ isActive }) => 
          isActive ? "text-white font-bold" : ""
        }
      >
        Table
      </NavLink>
      <NavLink 
        to="/health-declaration-form"
        className={({ isActive }) => 
          isActive ? "text-white font-bold" : ""
        }
      >
        Form
      </NavLink>
    </div>
  )
}

export default NavBar