import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      <section className='bg-brand p-10 w-1/2 items-center justify-center lg:flex xl:w-2/5 hidden md:block'>
        <div className='flex max-h-[800px] max-w-[430px] flex-col justify-between space-y-20'>
          <img
            src="/assets/icons/logo-full.svg"
            className ="w-[224px] h-[82px]"
          />
          <div className='space-y-5 text-white md:mb-5 3xl:mb-10'>
            <h1 className='h1'>Manage your files the best way</h1>
            <p className='body-1'>This is a place where you can store all your documents.</p>
          </div>
          <img src="assets/images/files.png"
                className ="w-[300px] h-[300px] 3xl:w-[342px] 3xl:h-[342px] transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>
      <Outlet/>
    </div>
  );
};

export default AuthLayout;
