import React, { useState, useEffect, useCallback } from 'react'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { TbEqual } from 'react-icons/tb'
import axios from 'axios';

import Loader from './components/Loader'

const App = () => {
  const [countryData, setCountryData] = useState();
  const [categoryGroups, setCategoryGroups] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [availableCountries] = useState(['Sweden', 'Mexico', 'Thailand', 'New Zealand'])
  const [selectedCountry, setSelectedCountry] = useState('')

  const getCountryData = useCallback(async () => {
    try {
      if (selectedCountry) {
        const { data } = await axios.get(`https://api.tradingeconomics.com/country/${selectedCountry}?c=${process.env.REACT_APP_KEY}`)

        // get unique CategoryGroups
        const categories = []
        data.forEach(item => !categories.includes(item.CategoryGroup) && categories.push(item.CategoryGroup))

        setCategoryGroups(categories.sort((a, b) => a.localeCompare(b)))
        setCountryData(data)
        setErrorMsg('')
        setLoading(false)
      }
    } catch (error) {
      if (error.response.data.includes("No Access to this country as free user.")) {
        setErrorMsg(error.response.data)
      }
      console.log(error.response.data)
      setLoading(false)
    }
  }, [selectedCountry])

  const selectCountry = (country) => {
    if (country !== selectedCountry) {
      setSelectedCountry(country)
      setLoading(true)
    }
  }

  useEffect(() => {
    let timer;
    timer = setTimeout(getCountryData, 500)
    return () => clearTimeout(timer)
  }, [getCountryData])

  return (
    <div className='bg-gradient text-slate-100 min-h-screen'>
      <div className='w-10/12 mx-auto'>
        <div className='pt-10'>
          <h2 className='text-2xl flex justify-center'>Select and view economic information for one of the available countries</h2>
          <div className='flex flex-row flex-wrap mt-16 lg:justify-between justify-center'>
            {availableCountries.map(country => (
              <div
                key={country}
                onClick={() => selectCountry(country)}
                className={`py-10 w-56 shadow-xl select-none font-bold m-4 text-center rounded-md text-lg uppercase ${country === selectedCountry ? 'bg-slate-200 text-black' : 'bg-sky-800'} cursor-pointer`}
              >
                {country}
              </div>
            ))}
          </div>
        </div>
        <div className='py-10'>
          {loading ? <Loader message={`Loading ${selectedCountry}...`} /> :
            <>
              {errorMsg ? <p className='opacity-80 text-center'>{errorMsg}</p> :
                <>
                  {categoryGroups?.map((cat, i) => (
                    <div key={`${cat}-${i}`}>
                      <h2 className='font-bold text-2xl my-6' key={cat}>{cat}</h2>
                      {countryData?.map((item, i) => (
                        <div key={i}>
                          {item.CategoryGroup === cat &&
                            <div className='m-3 bg-slate-300 text-zinc-900 p-3 w-full flex flex-row items-center justify-between rounded shadow-xl'>
                              <div className='flex flex-col'>
                                <h2 className='font-bold text-lg'>{item.Category}</h2>
                                <div className='flex'>
                                  {item.SourceURL !== '' ?
                                    <a
                                      href={item.SourceURL}
                                      target='_blank'
                                      rel="noreferrer"
                                      className='text-xs flex flex-row items-center mr-4 hover:underline'
                                    >
                                      Source <HiOutlineExternalLink className='ml-1' />
                                    </a>
                                    :
                                    <p></p>
                                  }
                                  <p className='text-xs'>Updated: {new Date(item.LatestValueDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className='flex flex-row items-center'>
                                <div className='flex flex-col items-center mr-2'>
                                  <h2 className='font-bold'>{(item.LatestValue).toLocaleString('en')}</h2>
                                  <p className='text-[0.6rem] text-left'>{item.Unit}</p>
                                </div>
                                {Math.abs(item.LatestValue) - Math.abs(item.PreviousValue) === 0
                                  ? <TbEqual className='text-lg' color='gray' />
                                  : Math.abs(item.LatestValue) - Math.abs(item.PreviousValue) > 0
                                    ? <FaChevronUp className='text-lg' color='green' />
                                    : <FaChevronDown className='text-lg' color='crimson' />
                                }
                                <p className={`text-xs ml-1 font-bold ${(+(item.LatestValue - item.PreviousValue).toFixed(2) / item.LatestValue * 100).toFixed(2) > 0 ? 'text-green-700' : 'text-rose-700'}`}>
                                  {(+(item.LatestValue - item.PreviousValue).toFixed(2) / item.LatestValue * 100).toFixed(2) === '0.00' ? '' : `${(+(item.LatestValue - item.PreviousValue).toFixed(2) / item.LatestValue * 100).toFixed(2)}%`}
                                </p>
                              </div>
                            </div>
                          }
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              }
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default App