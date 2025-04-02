import { useNavigate } from 'react-router-dom';
import './styles/home.css';


const Home = () => {
    const navigate = useNavigate();


    const handleOptions = async (page) =>{
        if(!navigator.onLine){
            const options = {
                title: "alert",
                message: "No Internet Connection!!",
            };
    
            const result = await window.electronAPI.showConfirmDialog(options);
        }else{
            navigate(page);
        }
    }

    return ( 
        <div className="home">
            <div className='header'>
                Boss DashBoard
                <img onClick={()=>{navigate('/')}} className='logout' src="./images/logout.png" alt="logout" />
            </div>
            <div className='body'>
                <div className='options' onClick={()=>{handleOptions('/add')}}>
                    Add a new Item
                </div>
                <div className='options' onClick={()=>{handleOptions('/edit')}}>
                    Edit Menu Items
                </div>
                <div className='options' onClick={()=>{handleOptions('/categories')}}>
                    Edit Categories
                </div>
            </div>
        </div>
    );
}
 
export default Home;