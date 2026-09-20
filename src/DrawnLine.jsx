export function DrawnLine({variant='sweep',className=''}){
 const paths={sweep:'M -40 270 C 150 20 500 330 480 145 C 455 -15 220 160 425 290 C 590 395 925 175 1240 245',loop:'M -40 370 C 270 450 210 15 505 75 C 820 140 385 430 655 360 C 855 300 940 15 1240 100',signature:'M -25 265 C 240 380 375 28 610 90 C 825 145 575 375 430 270 C 345 205 545 165 690 245 C 930 385 1000 120 1220 170'};
 return <svg className={`drawn-line drawn-line-${variant} ${className}`} data-drawn-line viewBox="0 0 1200 440" fill="none" aria-hidden="true"><path d={paths[variant]} pathLength="1"/></svg>
}
