import { DIV, FEdiv, FElement } from "../lib/htmltools.js";

function styleWidthString(percent: number, factor: number, noPointerEvents: boolean){
  return `height: 100%; width: calc(${percent} * (100% - ${factor}px)); ${noPointerEvents? "pointer-events: none;": ""}`
}
class DraggableDivider extends FEdiv{
  x: number;
  initialX: number;
  constructor(x: number, dividerWidth: number){
    super()
    this.withClass("divider").withAttributes({style: `width: ${dividerWidth}px; height: 100%`})
    this.x = x;
    this.initialX = x;
  }
}
export class FEverticalDivider extends FEdiv{
  
  constructor(dividerWidth: number, ...children: FElement[]){
    let mouseX;
    let selected = 0;
    let isDragging = false;

    let dividers = [];
    for(let i = 0; i < children.length - 1; i++){
      let divider = new DraggableDivider((i + 1) / children.length, dividerWidth);
      divider.onEvent("mousedown", (e) =>
      {
        divider.initialX = divider.x;
        selected = i;
        mouseX = e.clientX;
        isDragging = true;
      })
      dividers.push(divider);
    }
    let setDividerPosition = (i, x, mouseevents) => {
      
      let leftSide = (i == 0);
      let rightSide = (i == dividers.length - 1);
      let next = !rightSide? dividers[i + 1].x : 1;
      let prev = !leftSide? dividers[i - 1].x : 0;
      let percent = Math.min(Math.max(x, 0), 1);
      if(percent < prev && !leftSide){
        setDividerPosition(i-1,x, mouseevents);
      }
      if(percent > next && !rightSide){
        setDividerPosition(i+1,x, mouseevents);
      }

      let factor = dividers.length * dividerWidth;
      children[i].withAttributes({style: styleWidthString(percent - prev, factor, mouseevents)});
      children[i + 1].withAttributes({style: styleWidthString(next - percent, factor, mouseevents)});
      dividers[i].x = percent;
    }
    

    window.addEventListener("mousemove", (e) =>
    {
      if(isDragging){
        setDividerPosition(selected, dividers[selected].initialX + (e.clientX - mouseX) / this.element.clientWidth, true);
      }   
    });
    window.addEventListener("mouseup", (e) => {
      if(isDragging){
        isDragging = false;
        setDividerPosition(selected, dividers[selected].initialX + (e.clientX - mouseX) / this.element.clientWidth, false);
      }
      
    });
    
    
    
    super(
      children[0]
    );
    for(let i = 0; i < dividers.length; i++){
      this.addChildren(dividers[i], children[i+1]);
      setDividerPosition(i, dividers[i].x, false);
    }
    this.withClass("vertical-divider");
  }
}