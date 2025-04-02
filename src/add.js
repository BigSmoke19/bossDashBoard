import { useNavigate } from 'react-router-dom';
import './styles/add.css'
import { useState,useRef,useEffect } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import Loading from "./loading.js";
import { getCats } from './state/categories/categoriesSlice.js';
import { useDispatch,useSelector} from 'react-redux';

const Add = () => {
    const navigate = useNavigate();   

    const [item,setItem] = useState({
        id:"", image: "", name: "",category: "", price: 0,
        description: "", descriptionA:"",additions:"",subItems:[],ingredients :[]
    });

    const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const fileSize =  1 * 1024 * 1024;
    const [error,setError] = useState(null);
    const [isPending,setIsPending] = useState(false);
    const [prefix,setPrefix] = useState("data:image/png;base64,");

    const [subItem,setSubItem] = useState("");
    const [ing,setIng] = useState("");

    const db = getFirestore();

     const inputRefs = useRef([]);

         const dispatch = useDispatch();
     
         const { categories, status : catsStatus, error : catsError} = useSelector((state) => state.categories);
     
          useEffect(() => {
                 dispatch(getCats());
               }, [dispatch]);
    
        useEffect(() => {
            const handleKeyDown = (event) => {
                const currentIndex = inputRefs.current.indexOf(document.activeElement);
                if(currentIndex === 4){
                    let value = parseFloat(inputRefs.current[4].value);
                    if (event.key === 'ArrowRight') {
                        setItem(prev => ({...prev,price: parseFloat(value + 1)}));
                        event.preventDefault();
                    } else if (event.key === 'ArrowLeft') {
                        setItem(prev => ({...prev,price: parseFloat(value -1)}));
                        event.preventDefault();
                    }
                }
                if (event.key === 'Enter' && currentIndex < inputRefs.current.length - 1) {
                  inputRefs.current[currentIndex + 1].focus();
                  event.preventDefault();
                }
                else if (event.key === 'ArrowDown'  && currentIndex < inputRefs.current.length - 1) {
                    inputRefs.current[currentIndex + 1].focus();
                    event.preventDefault();
                } else if (event.key === 'ArrowUp'&& currentIndex > 0) {
                    inputRefs.current[currentIndex - 1].focus();
                    event.preventDefault();
                }
            };
    
            document.addEventListener('keydown', handleKeyDown);
    
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, []);


    const handleEdit = (data,att) =>{
        if(data === null){
            return null;
        }
        switch(att){
            case "category": setItem(prev => ({...prev,category: data}));
                break;
            case "name": setItem(prev => ({...prev,name: data}));
                break;
            case "price": setItem(prev => ({...prev,price: parseFloat(data)}));
                break;
            case "description": setItem(prev => ({...prev,description: data}));
                break;
            case "descriptionA": setItem(prev => ({...prev,descriptionA: data}));
                break;
            case "adds": setItem(prev => ({...prev,additions: data}));
                    break;
            case "ings": setItem(prev => ({...prev,ingredients: data}));
                    break;
            default: 
                break;
        }
        
        
    }

    const checkItem = ()=>{
        if(!item.price || item.price <= 0){
            setError("Price is not Valid!!");
            return false;
        }else if(item.name === "" || item.category === "" || item.description === "" || item.descriptionA === "" || item.image ===  ""){
            setError("Error : Some Fields are Empty!!");
            return false;
        }else{
            setError(null);
            return true;
        }
    }


    const handleSave = async () =>{
        setError(null);
        if(checkItem()){
            const pr = "data:image/png;base64,";
            const pureImage = item.image.slice(pr.length + 1);
            setIsPending(true);
            try {
                await addDoc(collection(db, "items"), {
                  name:item.name,
                  category:item.category,
                  description: item.description,
                  descriptionA: item.descriptionA,
                  image: pureImage,
                  price: parseFloat(item.price),
                  additions:item.additions,
                  subItems:item.subItems,
                  ingredients:item.ingredients
                });
                setIsPending(false);
                const options = {
                    title: "alert",
                    message: "item Added Successfuly!!",
                };
        
                const result = await window.electronAPI.showConfirmDialog(options);
                navigate('/home');
              } catch (e) {
                setIsPending(false);
                console.error("Error adding document: ", e);
                const options = {
                    title: "alert",
                    message: "Failed to add item!!",
                };
        
                const result = await window.electronAPI.showConfirmDialog(options);
              }
            
        }
    }


    const handleImage = (event) =>{
        const file = event.target.files[0];

        if(file){
            if(file.size <= fileSize && fileTypes.includes(file.type)){
                const reader = new FileReader();
                reader.onloadend = () =>{
                    setItem(prev => ({...prev,image: reader.result}));
                }
                reader.readAsDataURL(file);
                //setIsPending(false);
                setPrefix("");
            }else{
                //setIsPending(false);
                if(!fileTypes.includes(file.type)){
                    setError("Wrong file type!!");
                }else{
                    setError("image must be less than 1mb!!");
                }
            }
        }else{
            setError("Error in file upload!!");
        }
    }

    const handleSubItems = (item) =>{
        setSubItem(item);
    }

    const handleIngs = (item) =>{
        setIng(item);
    }

    const handleAddSubItems = async()=>{
        if(!subItem || subItem === ""){
            const options = {
                title: "alert",
                message: "No Sub Item to add!!!!",
            };
    
            const result = await window.electronAPI.showConfirmDialog(options);
        }else{
            const newSubs = item.subItems;
            newSubs.push(subItem);
            setItem(prev => ({...prev,subItems: newSubs}));
        }

        setSubItem("");
    }

    const handleRemoveSub = (sub)=>{
        const index = item.subItems.indexOf(sub);
        const array =  item.subItems;
        if (index > -1 && index < array.length) {
           array.splice(index, 1);
        }
        setItem(prev => ({...prev,subItems: array}));
    }

    const handleAddIng = async () => {
        if(!ing || ing === ""){
            const options = {
                title: "alert",
                message: "No ingredient  to add!!!!",
            };
    
            const result = await window.electronAPI.showConfirmDialog(options);
        }else{
            const newIngs = item.ingredients;
            newIngs.push(ing);
            setItem(prev => ({...prev,ingredients: newIngs}));
        }

        setIng("");
    };

    const handleRemoveIng = (ing) => {
        const index = item.ingredients.indexOf(ing);
        const array =  item.ingredients;
        if (index > -1 && index < array.length) {
           array.splice(index, 1);
        }
        setItem(prev => ({...prev,ingredients: array}));
    };


    return ( 
        <div className='add'>
            <div className='header'>
                <div onClick={()=>{navigate('/home')}}> <img className='arrow' src="./images/go-back-arrow.png" alt="go-back" /> </div>
                Add a New Item
            </div>
            {isPending && <Loading/>}
            {!isPending && <div className="edit-item-container" key={item.id}>
                        <div className="edit-content">
                            <div className="edit-image-container">
                                {(item.image) && <img className="edit-item-image" src={`${prefix}${item.image}`} alt="item-image" />}
                                <div className='image-upload-container'>
                                    <label htmlFor="upload" className='upload-label'>Upload a new Image</label>
                                    <input className='image-upload' id='upload' type="file"  onChange={(e)=>handleImage(e)} accept="image/*" />
                                </div>
                            </div>
                            <div className="edit-item-info">
                                <div className="edit-item-data">
                                    <p className="edit-info">Category</p>
                                    <select
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    value={item.category}
                                    id='cat-select'
                                    className="edit-data"
                                    onChange={(e)=>handleEdit(e.target.value,"category")} // Update category state
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                    ))}
                                </select>
                                </div>
                                <div className="edit-item-data">
                                    <p className="edit-info">Name</p>
                                    <input ref={(el) => (inputRefs.current[1] = el)} type='text' contentEditable={true} className="edit-data" onChange={(e)=>handleEdit(e.target.value,"name")} value={item.name}  />
                                </div>
                                <div className="edit-item-data">
                                    <p className="edit-info">Description</p>
                                    <input ref={(el) => (inputRefs.current[2] = el)} type='text' contentEditable={true} className="edit-data" value= {item.description} onChange={(e)=>handleEdit(e.target.value,"description")}/>
                                </div>
                                <div className="edit-item-data">
                                    <p className="edit-info">Arabic Description</p>
                                    <input ref={(el) => (inputRefs.current[3] = el)} type='text' contentEditable={true} className="edit-data" value= {item.descriptionA} onChange={(e)=>handleEdit(e.target.value,"descriptionA")}/>
                                </div>
                                <div className="edit-item-data">
                                    <p className="edit-info">Price $</p>
                                    <input ref={(el) => (inputRefs.current[4] = el)} type='number' contentEditable={true} className='edit-data' value={item.price} onChange={(e)=>handleEdit(e.target.value,"price")} />
                                </div>

                                <div className="edit-item-data">
                                    <p className="edit-info">Add Ingredients</p>
                                    <input ref={(el) => (inputRefs.current[5] = el)} value={ing} type="text" className='edit-data' onChange={(e)=>handleIngs(e.target.value)}/>
                                    <button  disabled={isPending} onClick={()=>handleAddIng()}> <img className='edit-logo' src="./images/add.png" alt="add" /></button>
                                </div>
                                {item.ingredients && item.ingredients.map((ing)=>(
                                    <div key={item.ingredients.indexOf(ing)} className="edit-item-data">
                                        <p className="edit-info">Ing {item.ingredients.indexOf(ing) +1 }</p>
                                        <p className='edit-data' >{ing}</p>
                                        <button  disabled={isPending} onClick={()=>{handleRemoveIng(ing)}}> <img className='edit-logo' src="./images/minus.png" alt="remove" /></button>
                                    </div>
                                ))}

                            
                                <div className="edit-item-data">
                                    <p className="edit-info">Add SubItem</p>
                                    <input ref={(el) => (inputRefs.current[6] = el)} value={subItem} type="text" className='edit-data' onChange={(e)=>handleSubItems(e.target.value)}/>
                                    <button  disabled={isPending} onClick={()=>handleAddSubItems()}> <img className='edit-logo' src="./images/add.png" alt="add" /></button>
                                </div>
                                {item.subItems && item.subItems.map((sub)=>(
                                    <div key={item.subItems.indexOf(sub)} className="edit-item-data">
                                        <p className="edit-info">SubItem {item.subItems.indexOf(sub) +1 }</p>
                                        <p className='edit-data' >{sub}</p>
                                        <button  disabled={isPending} onClick={()=>{handleRemoveSub(sub)}}> <img className='edit-logo' src="./images/minus.png" alt="remove" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="edit-save">
                            <button ref={(el) => (inputRefs.current[7] = el)} disabled={isPending} className='save-btn' onClick={handleSave}>Save</button>
                            
                        </div>
                       { error && <div className='error'>{error}</div>}

                </div>}
        </div>
     );
}
 
export default Add;