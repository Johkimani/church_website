import { useEffect, useState } from "react";
import axios from "axios";

export default function WeeklyActivitiesAdmin() {

const [activities,setActivities]=
useState([]);

const [form,setForm]=useState({
title:"",
dayOfWeek:"",
startTime:"",
endTime:"",
location:""
});

useEffect(()=>{
load();
},[]);

async function load(){
const res=
await axios.get(
"/api/v1/admin/weekly"
);

setActivities(
res.data
);
}

async function create(){

await axios.post(
"/api/v1/admin/weekly",
form
);

load();
}

return(

<div>

<h2 className="text-3xl font-bold mb-6">
Weekly Activities
</h2>

<div className="bg-white p-5 rounded">

<input
placeholder="Activity"
className="border p-2 w-full mb-3"

onChange={(e)=>
setForm({
...form,
title:e.target.value
})
}
/>

<input
placeholder="Day"
className="border p-2 w-full mb-3"

onChange={(e)=>
setForm({
...form,
dayOfWeek:e.target.value
})
}
/>

<input
placeholder="Start Time"
className="border p-2 w-full mb-3"

onChange={(e)=>
setForm({
...form,
startTime:e.target.value
})
}
/>

<input
placeholder="End Time"
className="border p-2 w-full mb-3"

onChange={(e)=>
setForm({
...form,
endTime:e.target.value
})
}
/>

<input
placeholder="Venue"
className="border p-2 w-full"

onChange={(e)=>
setForm({
...form,
location:e.target.value
})
}
/>

<button
onClick={create}

className="mt-4 bg-green-700 text-white px-6 py-2 rounded"
>
Add Activity
</button>

</div>

<div className="mt-8">

{
activities.map((a:any)=>(
<div
key={a.id}

className="bg-white p-4 mb-3 rounded"
>

<h3 className="font-bold">
{a.title}
</h3>

<p>
{a.dayOfWeek}
</p>

<p>
{a.startTime}
—
{a.endTime}
</p>

</div>
))
}

</div>

</div>

);
}
