import {
useEffect,
useState
}
from "react";

import axios from "axios";

export default function SemesterActivitiesAdmin(){

const[
events,
setEvents
]=useState([]);

useEffect(()=>{
load();
},[]);

async function load(){

const res=
await axios.get(
"/api/v1/admin/semester"
);

setEvents(
res.data
);

}

return(

<div>

<h2 className="text-3xl font-bold mb-6">

Semester Activities

</h2>

<div className="space-y-4">

{
events.map((e:any)=>(

<div
key={e.id}

className="bg-white rounded p-5"
>

<h3 className="font-bold">

{e.title}

</h3>

<p>

{e.description}

</p>

<p>

{e.date}

</p>

</div>

))
}

</div>

</div>

);

}