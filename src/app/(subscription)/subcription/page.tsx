'use client'
import React from 'react'
import { useAllSubscription } from './hooks'

const page = () => {


  const {data}=useAllSubscription();

  console.log(data);
  
  
  return (
    <div>page</div>
  )
}

export default page