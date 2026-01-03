

export const deadlineTimestamp = (value:string)=>{
    if(!value){
        throw new Error("Please provide Deadline!")
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
        throw new Error("Invalid datetime-local value");
    }
    return Math.floor(date.getTime()/1000)
}