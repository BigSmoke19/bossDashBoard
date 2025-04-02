import { getCats } from './state/categories/categoriesSlice2.js';
import './styles/categories.css';
import { useNavigate} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { useEffect,useRef,useState } from 'react';
import Loading from './loading.js';
import {doc, deleteDoc,updateDoc, getFirestore,collection,addDoc} from "firebase/firestore";
import { dataBase } from './configure.js';


const Categories = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { categories : cats , status, error} = useSelector((state) => state.categories2);
    const [categories,setCategories] = useState([]);

    const [isPending,setIsPending] = useState(false);
    const [addError,setError] = useState(null);

     const inputRefs = useRef([]);

     const [NewCatName,setNewCatName] = useState(null);
     const [NewCatPriority,setNewCatPriority] = useState(0);

     const db = getFirestore();
    
        useEffect(() => {
            const handleKeyDown = (event) => {
                const currentIndex = inputRefs.current.indexOf(document.activeElement);
                if(currentIndex === 1){
                    let value = parseFloat(inputRefs.current[1].value);
                    if (event.key === 'ArrowRight') {
                      setNewCatPriority(value + 1);
                        event.preventDefault();
                    } else if (event.key === 'ArrowLeft') {
                      setNewCatPriority(value - 1);
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

      useEffect(() => {
        dispatch(getCats());
      }, [dispatch]);

      useEffect(()=>{
        setCategories(cats);
      },[cats]);

      const handleSave = async () => {
        if (true) {  // This condition seems redundant. You can remove it if not needed.
          setIsPending(true);
      
          // Use forEach to iterate over categories
          for (const cat of categories) {
            try {
              // Reference to the document in Firestore
              const docRef = doc(dataBase, "categories", cat.id);
      
              // Update the document with category and priority
              await updateDoc(docRef, {
                category: cat.category,  // Update category field
                priority: parseInt(cat.priority),  // Update priority field
              });
      
            } catch (e) {
              // Handle errors if the update fails
              console.error("Error editing document: ", e);
              setIsPending(false);
      
              const options = {
                title: "Alert",
                message: "Failed to edit item!!",
              };
      
              // Show a confirmation dialog in your Electron app
              const result = await window.electronAPI.showConfirmDialog(options);
            }
          }
      
          setIsPending(false);  // Set pending status to false after all updates are done
        }
      };

      const handleAddCat = async () =>{
        setError(null);
        if(NewCatName !== null && NewCatPriority !== 0){
          setIsPending(true);
          try {
              await addDoc(collection(db, "categories"), {
                category:NewCatName,
                priority: parseInt(NewCatPriority),
                
              });
              setIsPending(false);
              const options = {
                  title: "alert",
                  message: "Category Added Successfuly!!",
              };
      
              const result = await window.electronAPI.showConfirmDialog(options);
            } catch (e) {
              setIsPending(false);
              console.error("Error adding document: ", e);
              const options = {
                  title: "alert",
                  message: "Failed to add Category!!",
              };
      
              const result = await window.electronAPI.showConfirmDialog(options);
            }
                      
        }else{
          setError("New category inputs are not valid");
        }
      }

      
    const handleDelete = async (docId) => {
      const options = {
          title: "Confirm Action",
          message: "Are you sure you want to Delete this Item??",
      };

      const result = await window.electronAPI.showConfirmDialog(options);

      if (result === 0) {
          setIsPending(true);
          try {
              await deleteDoc(doc(db, "categories", docId));
              setIsPending(false);
              const options = {
                  title: "alert",
                  message: "item deleted successfully!!",
              };
      
              const result = await window.electronAPI.showConfirmDialog(options);
            } catch (e) {
              setIsPending(false);
              console.error("Error deleting document: ", e);

              const options = {
                  title: "alert",
                  message: "Failed to delete the item!!",
              };
      
              const result = await window.electronAPI.showConfirmDialog(options);
            }
      } else {

      }
  };

    return (
        <div className="cats">
            <div className='header'>
                <div onClick={()=>{navigate('/home')}}> <img className='arrow' src="./images/go-back-arrow.png" alt="go-back" /> </div>
                Edit Categories
            </div>
            <div className='add-container'>
               <h2>Add a new Category</h2>
               <p>Name</p>
               <input value={NewCatName} onChange={(e)=>setNewCatName(e.target.value)} ref={(el) => (inputRefs.current[0] = el)} type="text" />
               <p>Priority</p>
               <input value={NewCatPriority} onChange={(e)=>setNewCatPriority(e.target.value)} ref={(el) => (inputRefs.current[1] = el)} type="number" />
               <button disabled={isPending} className='save-btn' onClick={handleAddCat} ref={(el) => (inputRefs.current[2] = el)}>Add</button>
               {addError && <p>{addError}</p>}
            </div>
            <div className="cats-container">
                {(status === "loading" || isPending) && <Loading/>}
                {!isPending && status === "succeeded" && categories && categories.map((category)=>(
                    <div className='cat' key={category.id}>
                        <img onClick={()=>handleDelete(category.id)} src="./images/bin.png" alt="X" className='bin' />
                        <input type='number' value={category.priority} className='cat-priority' onChange={(e)=>{
                            setCategories(prev => prev.map((cat)=>cat.id === category.id?
                            {...cat,priority: e.target.value} : cat
                        ))
                        }}/>
                        <span className='cat-name'>{category.category}</span>
                    </div>
                ))}
            <div>
                <button disabled={isPending} className='save-btn' onClick={handleSave}>Save</button>
            </div>
            </div>
        </div>
     );
}
 
export default Categories;