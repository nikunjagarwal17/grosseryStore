import React, { useEffect, useState } from "react";
import {useAppContext} from '../../context/appContext'
import toast from "react-hot-toast";


const SellerLogin = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {isSeller, setIsSeller, navigate, axios} = useAppContext();
    useEffect(()=>{
        if(isSeller){
            navigate('/seller');
        }
    },[isSeller])
    const onSubmitHandler = async (event)=>{
        try {
            event.preventDefault();
            const {data} = await axios.post('/api/seller/login',{email,password})
            if(data.success){
                setIsSeller(true);
                navigate('/seller')
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }

    }
    return !isSeller && (
        <div onSubmit={onSubmitHandler} className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-grey-600 bg-black/50">
            <form onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-5 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">Seller</span> login
                </p>
                
                <div className="w-full ">
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
                </div>
                <div className="w-full ">
                    <p>Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
                </div>
                <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer">
                    Login
                </button>
            </form>
        </div>
        
    );
};

export default SellerLogin;