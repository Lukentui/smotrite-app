import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'react-tooltip/dist/react-tooltip.css'
import { ArrowDownIcon, CogIcon, RefreshIcon } from '@heroicons/react/outline'
import { Button } from '@tremor/react'
// import * as Store from 'electron-store'

const RootWrapper = () => {
	const [active, setActive] = useState(
		localStorage.getItem('tab')
			? Number(localStorage.getItem('tab'))
			: 0
	)

	return <>
		<div className="global-frame-layout">
			<div className="frame-part">
				<div className="macos-buttons">
					<span className="macos-buttons_items" onClick={() => (window as any).api.send('close')}></span>
					<span className="macos-buttons_items" onClick={() => (window as any).api.send('minimize')}></span>
					<span className="macos-buttons_items"></span>
				</div>

				<div className="screens-tabs">
					<div className="screens-tabs__wrapper">
						<div className="dashboard tabs-item"
						
						style={{ color: active === 0 ? '#211e1e' : 'rgb(33 30 30 / 63%)', cursor: active === 1 ? 'pointer' : 'default' }}
						
						onClick={() => {
							setActive(0);
							localStorage.setItem('tab', '0')
						}}>Dashboard</div>
						<div className="task-manager tabs-item"
						
						style={{ color: active === 1 ? '#211e1e' : 'rgb(33 30 30 / 63%)', cursor: active === 1 ? 'default' : 'pointer' }}
						
						onClick={() => {
							setActive(1);
							localStorage.setItem('tab', '1')
						}}>Task manager</div>

						<div className="grey-space" style={{ transform: `translate(${active*100}%, 0px)` }}></div>
					</div>
				</div>

				<div className="toolbar-drag-button" onClick={() => (window as any).api.send('settings-button')}>
					<svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
			</div>

			{/* {store.has('layout')} */}

			<div className="app-part">
				<div className='frame-part-backdrop'></div>
				
				<App tab={active} />
			</div>
		</div>
	</>
}

// const store = new Store();
ReactDOM.createRoot(document.getElementById('root')!).render(<><RootWrapper/></>)

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
	console.log(message)
})
