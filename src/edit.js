import {useNavigate } from 'react-router-dom';
import "./styles/edit.css";
import { useState,useEffect } from 'react';
import Loading from './loading.js';
import { useDispatch,useSelector } from 'react-redux';
import { getItems } from './state/items/itemsSlice.js';
import { getCats } from "./state/categories/categoriesSlice.js";


const Edit = () => {

    const dispatch = useDispatch();

    const { items, status, error } = useSelector((state) => state.items);
    const { categories , status : categoriesStatus, error : categoriesError } = useSelector((state) => state.categories);

    const [currentItems,setCurrentItems] = useState(items);
    const [currentCat,setCurrentCat] = useState("all");
    const navigate = useNavigate();

    const [arabic,setArabic] = useState(false);


    useEffect(() => {
        dispatch(getItems());
      }, [dispatch]);

      useEffect(() => {
        dispatch(getCats());
      }, [dispatch]);


        useEffect(()=>{
            const sortedItems = [...items].sort((a, b) => {
                const categoryComparison = categories.indexOf(a.category) - categories.indexOf(b.category);
                if (categoryComparison === 0) {
                  // If categories are the same, sort alphabetically by name
                  return a.name.localeCompare(b.name);
                }
                return categoryComparison;
              });
              
              setCurrentItems(sortedItems);
              
        },[items]);


        const handleMenu = (cat)=>{
            if(cat === "all"){
                const sortedItems = [...items].sort((a, b) => {
                    const categoryComparison = categories.indexOf(a.category) - categories.indexOf(b.category);
                    if (categoryComparison === 0) {
                      // If categories are the same, sort alphabetically by name
                      return a.name.localeCompare(b.name);
                    }
                    return categoryComparison;
                  });
                  
                  setCurrentItems(sortedItems);
                  
            }else{
                let newItems = [];
                if(items){
                    items.forEach(item => {
                        if(item.category === cat){
                            newItems.push(item);
                        }
                    });
                };
                newItems = [...newItems].sort((a, b) => a.category.localeCompare(b.category));
                setCurrentItems(newItems);
            }
    
        }
    

    const handleEdit = (item) =>{
        navigate('/item', { state: { item } });
    };




    return ( 
    <div className='edit'>
        <div className='header'>
                <div onClick={()=>{navigate('/home')}}> <img className='arrow' src="./images/go-back-arrow.png" alt="go-back" /> </div>
                Edit Items
        </div>
        <div className="menu" id="menu" >
            <div className="edit-header">
                    <label className="switch">
                        <input type="checkbox" onChange={()=>setArabic(!arabic)} />
                        <div className="slider"></div>
                        <div className="slider-card">
                            <div className="slider-card-face slider-card-front">En</div>
                            <div className="slider-card-face slider-card-back">Ar</div>
                        </div>
                    </label>
                </div>
            {status === 'loading' && <Loading />}
            <div className="categories">
            {status === 'succeeded' && items.length !== 0 && 
            <div className={(currentCat!== "all")?"category":"current-cat"} onClick={()=>{handleMenu("all");setCurrentCat("all");}}>
                        All
            </div>
            }
            {status === 'succeeded' && (items.length === 0)?null:
                Array.from(categories).map((category)=>(
                    <div key={category} className={(currentCat !== category)?"category":"current-cat"} onClick={()=>{handleMenu(category);setCurrentCat(category);}}>
                        {category}
                    </div>
                ))
            }
            </div>
            <div className="items-container">
            {status === 'succeeded' && (currentItems.length === 0)?<h2>No Items Yet....</h2>:
                currentItems.map((item)=>(
                    <div className="item-container" key={item.id}>
                        <div className="image-container">
                            <img className="item-image" src={`data:image/png;base64,${item.image}`} alt="item-image" />
                        </div>
                        <div className="item-info">
                            <p id="category" className="item-data">{item.category}</p>
                            <p id="name" className="item-data">{item.name}</p>
                            <p id="description" className="item-data">{(arabic)?(item.descriptionA)?item.descriptionA:"":item.description}</p>
                            <div className="item-data" id="item-footer">
                                <p id="price">{item.price}$</p>
                                <img onClick={()=>{handleEdit(item)}} className="edit-logo" src="./images/edit.png" alt="edit" />
                            </div>
                        </div>
                    </div>
                ))
            }
            </div>
            {error && <div>{error}</div>}
        </div>
    </div> 
    );
}
 
export default Edit;