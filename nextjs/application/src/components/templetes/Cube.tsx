import { FC, useEffect, useRef, memo } from 'react';
import Script from 'next/script';

import "@/styles/libs/cube.css";

type Props = {
	enabled?: boolean;
}

const Cube: FC<Props> = memo(({ enabled = true }) => {

	const cubeRef = useRef<HTMLDivElement>(null);
	const cube = useRef<any>(null);
	const firstRender = useRef(false);

	useEffect(() => {

		const container = document.querySelector( '#container' );
		
		setTimeout(() => {
			console.log((window as any).ERNO);
			
			if(typeof (window as any).ERNO === 'undefined')return;
	
	
			cube.current = new (window as any).ERNO.Cube();
			
			container!.appendChild(cube.current.domElement);
	
			if(enabled){
				cube.current.shuffle();
			}else{
				cube.current.mouseControlsEnabled = false;
				cube.current.keyboardControlsEnabled = false;
			}
		}, 500);

		return () => {
			if (container) {
				container.removeChild(cube.current.domElement);
			}
		}
	},[]);

	useEffect(() => {
		if(!enabled || !cube.current) return;

		if(firstRender.current) return;
		firstRender.current = true;

		cube.current.mouseControlsEnabled = true;
		cube.current.keyboardControlsEnabled = true;
		cube.current.shuffle();
	},[enabled]);

	return (
		<>
			<Script strategy="lazyOnload" src="/js/fewfewaidfaemwklgiafdsk.js" onLoad={() => console.log('ERNO script loaded')} />
			<div id="container" ref={ cubeRef } className="m-Cube" style={{ width: '100%', height: '100%'}}></div>
		</>
	)
});

export default Cube;
