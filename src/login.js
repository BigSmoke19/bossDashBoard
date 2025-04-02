import { useState,useEffect,useRef } from 'react';
import './styles/login.css';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { signInAnonymously } from 'firebase/auth';
import { auth } from './configure.js';


const Login = () => {

    const [user,setUser] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState(null);
    const [isPending,setIsPending] = useState(false);
    const navigate = useNavigate();
    const db = getFirestore();

    const inputRefs = useRef([]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const currentIndex = inputRefs.current.indexOf(document.activeElement);
            if (event.key === 'Enter' && currentIndex < inputRefs.current.length - 1) {
              inputRefs.current[currentIndex + 1].focus();
              event.preventDefault();
            }
            else if (event.key === 'ArrowDown'  && currentIndex < inputRefs.current.length - 1) {
                inputRefs.current[currentIndex + 1].focus();
            } else if (event.key === 'ArrowUp'&& currentIndex > 0) {
                inputRefs.current[currentIndex - 1].focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        signInAnonymously(auth)
        .then(() => {
        console.log("Signed in anonymously");
        })
        .catch((error) => {
        console.error("Anonymous sign-in error:", error);
        });
    }, []);

    const handleLogin = async () =>{
        setIsPending(true);
        setError(null);
        try {
            // Query the collection to find the document by name
            const q = query(
              collection(db, "users"), // Replace with your collection name
              where("user", "==", user)
            );
      
            // Get the documents that match the query
            const querySnapshot = await getDocs(q);
      
            if (!querySnapshot.empty) {
              // Assuming there's only one document for this name
              const document = querySnapshot.docs[0];


            (password === document.data().password)?navigate('/home'):setError("Wrong Password!!");

            } else {
              setError("No User found!!");
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          }
          setIsPending(false);
    }


    return (
         <div className="login">
            <img className='logo' src="./images/logos.png" alt="Boss" />
            <div className="login-container">
                
                <div className="login-input-container">
                    <label className='login-label'>User: </label>
                    <input ref={(el) => (inputRefs.current[0] = el)} disabled={isPending} onChange={(e)=>{setUser(e.target.value)}} className="login-input" type="text" />
                </div>
                <div className="login-input-container">
                    <label className='login-label'>Password: </label>
                    <input ref={(el) => (inputRefs.current[1] = el)} disabled={isPending} onChange={(e)=>{setPassword(e.target.value)}} className="login-input" type="password" />
                </div>
                <div className="login-input-container">
                    <button ref={(el) => (inputRefs.current[2] = el)} disabled={isPending} className='login-btn' onClick={handleLogin}>{(isPending)?"Logging in ... ":"Login"}</button>
                </div>
            </div>
            {error && <div style={{fontSize:"x-large"}} className="error">{error}</div>}
         </div> 
        );
}
 
export default Login;