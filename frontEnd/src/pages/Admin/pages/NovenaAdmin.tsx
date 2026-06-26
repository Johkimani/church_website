import { useState } from "react";

export default function NovenaAdmin(){

const[
form,
setForm
]=useState({
title:"",
startDate:"",
endDate:""
});

return(

<div>

<h2 className="text-3xl mb-5">

Novena Override

</h2>

<input
type="text"
placeholder="Title"

className="border p-3 block mb-3"
/>

<input
type="date"

className="border p-3 block mb-3"
/>

<input
type="date"

className="border p-3 block mb-3"
/>

<button
className="bg-green-700 text-white px-5 py-2 rounded"
>

Create Novena

</button>

</div>

);

}