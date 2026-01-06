"use client"
import { ILead } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useLeadsStore } from "./leadStore";

export default function LeadStoreInit
({ leads}:
{ leads: ILead[] }) 
{
    const initialized =useRef(false)
    const setLeads = useLeadsStore(state=>state.setLeads)

    useEffect(()=>{
        if(!initialized.current){
            setLeads(leads)
            initialized.current=true
        }

    },[[leads, setLeads]]);

    return null;

}