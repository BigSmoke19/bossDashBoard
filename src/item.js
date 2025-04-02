import { useEffect, useState, useRef} from 'react';
import './styles/item.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from './loading.js';
import { getFirestore, doc, deleteDoc,updateDoc} from "firebase/firestore";
import { getCats } from './state/categories/categoriesSlice.js';
import { useDispatch,useSelector} from 'react-redux';


const Item = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const EditItem = (location.state || null);

    const fileTypes = ['image/jpeg', 'image/png', 'image/gif','image/webp'];
    const fileSize =  1 * 1024 * 1024;
    const [error,setError] = useState(null);
    const [prefix,setPrefix] = useState("data:image/png;base64,");
    const [isPending,setIsPending] = useState(false);

    const [subItem,setSubItem] = useState("");
    const [ing,setIng] = useState("");

    const db = getFirestore();
    const [imageChanged,setImageChanged] = useState(false);

    const [id, setId] = useState("");
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [descriptionA, setDescriptionA] = useState("");
    const [additions, setAdditions] = useState("");
    const [subItems, setSubItems] = useState([]);
    const [ingredients, setIngredients] = useState([]);

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
                    setPrice(value + 1);
                    event.preventDefault();
                } else if (event.key === 'ArrowLeft') {
                    setPrice(value - 1);
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
        if (EditItem) {
            setId(EditItem.item.id || "");
            setImage(EditItem.item.image || "");
            setName(EditItem.item.name || "");
            setCategory(EditItem.item.category || "");
            setPrice(EditItem.item.price || 0);
            setDescription(EditItem.item.description || "");
            setDescriptionA(EditItem.item.descriptionA || "");
            setAdditions(EditItem.item.additions || "");
            setSubItems(EditItem.item.subItems || []);
            setIngredients(EditItem.item.ingredients || []);
        }

        
    }, [EditItem]);

    /*useEffect(()=>{
        if(id !== ""){
            const upload = document.getElementById('upload');
            upload.click();
        }
    },[id])*/


    
    const checkItem = () => {
        if (price <= 0) {
            setError("Price is not valid!!");
            return false;
        } else if (name.trim() === "" || category.trim() === "" || description.trim() === "" || descriptionA.trim() === "" || image.trim() === "") {
            setError("Error: Some fields are empty!!");
            return false;
        } else {
            setError(null);
            return true;
        }
    };

   /* const compressJson = (jsonData) => {
        const jsonString = JSON.stringify(jsonData);
        const compressedData = pako.deflate(jsonString, { level: 9 }); // Max compression level
        return compressedData;
      };
    
      const decompressJson = (compressedData) => {
        const decompressedString = pako.inflate(compressedData, { to: "string" });
        return JSON.parse(decompressedString);
      };*/
    
    const handleSave = async () => {
        if (checkItem()) {
            let pureImage = image;
            if (imageChanged) {
                const pr = "data:image/png;base64,";
                pureImage = image.slice(pr.length + 1);
            }
    
            setIsPending(true);
            try {
                const docRef = doc(db, "items", id);

                await updateDoc(docRef, {
                    name,
                    category,
                    description,
                    descriptionA,
                    image: pureImage,
                    price: parseFloat(price),
                    additions,
                    subItems,
                    ingredients
                });
    
                setImage(pureImage); // Ensure image updates if changed
    
                setIsPending(false);
                const options = {
                    title: "alert",
                    message: "Item edited successfully!!",
                };
        
                const result = await window.electronAPI.showConfirmDialog(options);
                navigate('/edit');
            } catch (e) {
                setIsPending(false);
                console.error("Error editing document: ", e);
                const options = {
                    title: "alert",
                    message: "Failed to edit item!!",
                };
        
                const result = await window.electronAPI.showConfirmDialog(options);
            }
        }
    };
    

    const handleDelete = async (docId) => {
        const options = {
            title: "Confirm Action",
            message: "Are you sure you want to Delete this Item??",
        };

        const result = await window.electronAPI.showConfirmDialog(options);

        if (result === 0) {
            setIsPending(true);
            try {
                await deleteDoc(doc(db, "items", docId));
                setIsPending(false);
                const options = {
                    title: "alert",
                    message: "item deleted successfully!!",
                };
        
                const result = await window.electronAPI.showConfirmDialog(options);
                navigate('/edit');
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

    const handleImage = async (event) =>{
        setIsPending(true);
        setError(null);
        setImageChanged(true);
        const file = event.target.files[0];
        /*const compressedFileUrl = await handleCompress(intialfile);

        if (compressedFileUrl) {
            
            const response = await axios.get(compressedFileUrl, { responseType: 'blob' });
            const file = response.data;


                // Get the file size in bytes
    const compressedFileSize = response.data.size;
    
    // Convert bytes to KB or MB
    const fileSizeInKB = (compressedFileSize / 1024).toFixed(2); // KB
    const fileSizeInMB = (compressedFileSize / (1024 * 1024)).toFixed(2); // MB

    console.log(`Compressed File Size: ${fileSizeInKB} KB (${fileSizeInMB} MB)`);*/

        if(file){
            if(file.size <= fileSize && fileTypes.includes(file.type)){
                const reader = new FileReader();
                reader.onloadend = () =>{
                    setImage(reader.result);
                }
                reader.readAsDataURL(file);
                //setIsPending(false);
                setPrefix("");
                setIsPending(false);
            }else{
                //setIsPending(false);
                if(!fileTypes.includes(file.type)){
                    setError("Wrong file type!!");
                }else{
                    setError("image must be less than 1mb!!");
                }
                setIsPending(false);
            }
        }else{
            setError("Error in file upload!!");
            setIsPending(false);
        }

    //}
    }



    const handleAddSubItems = () => {
        if (subItem.trim() !== "") {
            setSubItems([...subItems, subItem]);
            setSubItem("");
        }
    };

    const handleRemoveSub = (sub) => {
        setSubItems(subItems.filter((item) => item !== sub));
    };

    const handleAddIng = () => {
        if (ing.trim() !== "") {
            setIngredients([...ingredients, ing]);
            setIng("");
        }
    };

    const handleRemoveIng = (sub) => {
        setIngredients(ingredients.filter((item) => item !== sub));
    };


    
    return (
        <div className="item">
            <div className='header'>
                <div onClick={() => navigate('/edit')}>
                    <img className='arrow' src="./images/go-back-arrow.png" alt="go-back" />
                </div>
                Edit Item
            </div>

            {isPending  && <div className='loading'><Loading /></div>}

            {EditItem &&  !isPending && (
                <div className="edit-item-container" key={id}>
                    <div className="edit-content">
                        <div className="edit-image-container">
                            {image && <img className="edit-item-image" src={`${prefix}${image}`} alt="item-image" />}
                            <div className='image-upload-container'>
                                <label htmlFor="upload" className='upload-label'>Upload a new Image</label>
                                <input
                                    className='image-upload'
                                    id='upload'
                                    type="file"
                                    onChange={(e) => handleImage(e)}
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="edit-item-info">
                            <div className="edit-item-data">
                                <p className="edit-info">Category</p>
                                <select
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    value={category}
                                    id='cat-select'
                                    className="edit-data"
                                    onChange={(e) => setCategory(e.target.value)} // Update category state
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
                                <input ref={(el) => (inputRefs.current[1] = el)} type='text' className="edit-data" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="edit-item-data">
                                <p className="edit-info">Description</p>
                                <input ref={(el) => (inputRefs.current[2] = el)} type='text' className="edit-data" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>

                            <div className="edit-item-data">
                                <p className="edit-info">Arabic Description</p>
                                <input ref={(el) => (inputRefs.current[3] = el)} type='text' className="edit-data" value={descriptionA} onChange={(e) => setDescriptionA(e.target.value)} />
                            </div>

                            <div className="edit-item-data" id="edit-item-footer">
                                <p className="edit-info">Price $</p>
                                <input ref={(el) => (inputRefs.current[4] = el)} type='number' className='edit-data' value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>

                            <div className="edit-item-data">
                                <p className="edit-info">Add SubItem</p>
                                <input ref={(el) => (inputRefs.current[5] = el)} type="text" className='edit-data' value={subItem} onChange={(e) => setSubItem(e.target.value)} />
                                <button disabled={isPending} onClick={handleAddSubItems}>
                                    <img className='edit-logo' src="./images/add.png" alt="add" />
                                </button>
                            </div>

                            {Array.from(subItems).map((sub, index) => (
                                <div key={index} className="edit-item-data">
                                    <p className="edit-info">SubItem {index + 1}</p>
                                    <p className='edit-data'>{sub}</p>
                                    <button disabled={isPending} onClick={() => handleRemoveSub(sub)}>
                                        <img className='edit-logo' src="./images/minus.png" alt="remove" />
                                    </button>
                                </div>
                            ))}

                            <div className="edit-item-data">
                                <p className="edit-info">Add Ingredients</p>
                                <input ref={(el) => (inputRefs.current[6] = el)} type="text" className='edit-data' value={ing} onChange={(e) => setIng(e.target.value)} />
                                <button disabled={isPending} onClick={handleAddIng}>
                                    <img className='edit-logo' src="./images/add.png" alt="add" />
                                </button>
                            </div>

                            {Array.from(ingredients).map((ing, index) => (
                                <div key={index} className="edit-item-data">
                                    <p className="edit-info">Ing {index + 1}</p>
                                    <p className='edit-data'>{ing}</p>
                                    <button disabled={isPending} onClick={() => handleRemoveIng(ing)}>
                                        <img className='edit-logo' src="./images/minus.png" alt="remove" />
                                    </button>
                                </div>
                            ))}

                        </div>
                    </div>

                    <div className="edit-save">
                        <button ref={(el) => (inputRefs.current[7] = el)} className='save-btn' onClick={handleSave}>Save</button>
                        <button className='save-btn' onClick={() => handleDelete(id)}>Delete</button>
                    </div>

                    {error && <div className='error'>{error}</div>}
                </div>
            )}
        </div>
    );
};

export default Item;