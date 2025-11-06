'use client'
import React from 'react'
import { useAllSubscription } from './hooks'

const Page = () => {


  const {data}=useAllSubscription();

  console.log(data);
  
  
  return (
    <div>page</div>
  )
}

export default Page