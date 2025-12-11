/* Shared site interactions: mobile nav, horizontal touch drag, cart (localStorage), simple animations */

(() => {
  // NAV TOGGLE (mobile)
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(menuToggle){
    menuToggle.addEventListener('click', ()=> {
      if(navLinks.style.display === 'flex') navLinks.style.display = 'none';
      else navLinks.style.display = 'flex';
    });
  }

  // Simple fade-in for elements with .fade-in
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.fade-in').forEach(el=>{
      el.style.opacity = 0;
      el.style.transform = 'translateY(8px)';
      setTimeout(()=>{ el.style.transition = 'opacity .6s ease, transform .6s ease'; el.style.opacity = 1; el.style.transform = 'none'; }, 120);
    });
  });

  // HORIZONTAL TOUCH DRAG SUPPORT for containers
  function makeScrollable(selector){
    document.querySelectorAll(selector).forEach(row=>{
      let isDown=false, startX, scrollLeft;
      row.addEventListener('mousedown', (e)=>{
        isDown = true; row.classList.add('dragging');
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('mouseleave', ()=> { isDown=false; row.classList.remove('dragging');});
      row.addEventListener('mouseup', ()=> { isDown=false; row.classList.remove('dragging');});
      row.addEventListener('mousemove', (e)=>{
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 1.8;
        row.scrollLeft = scrollLeft - walk;
      });

      // touch
      row.addEventListener('touchstart', (e)=>{
        startX = e.touches[0].pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      }, {passive:true});
      row.addEventListener('touchmove', (e)=>{
        const x = e.touches[0].pageX - row.offsetLeft;
        const walk = (x - startX) * 1.8;
        row.scrollLeft = scrollLeft - walk;
      }, {passive:true});
    });
  }
  makeScrollable('.horizontal-scroll');
  makeScrollable('.draggable-row');

  /* -------------------------
     SIMPLE CART (LOCAL STORAGE)
     - addItem(id, title, price)
     - renderCartCount()
     - getCart()
  -------------------------*/
  function getCart(){
    try {
      return JSON.parse(localStorage.getItem('nk_cart')||'[]');
    } catch (e){
      return [];
    }
  }
  function saveCart(cart){ localStorage.setItem('nk_cart', JSON.stringify(cart)); }

  function addItem(item){
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === item.id);
    if(idx > -1) { cart[idx].qty += 1; }
    else cart.push({...item, qty:1});
    saveCart(cart);
    renderCartCount();
    // small visual feedback
    if(window.navigator.vibrate) navigator.vibrate(40);
  }

  function renderCartCount(){
    const btn = document.querySelector('.cart-count');
    const cart = getCart();
    const total = cart.reduce((s,i)=>s+i.qty,0);
    if(btn) btn.textContent = total;
  }

  // Assign add-to-cart buttons if present
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('[data-add]');
    if(a){
      const id = a.getAttribute('data-id');
      const title = a.getAttribute('data-title');
      const price = parseFloat(a.getAttribute('data-price')||0);
      addItem({id,title,price});
      // quick toast
      showToast(`${title} added to cart`);
    }
  });

  // Toast helper
  let toastTimer=0;
  function showToast(text){
    clearTimeout(toastTimer);
    let t = document.getElementById('nk_toast');
    if(!t){ t = document.createElement('div'); t.id='nk_toast'; document.body.appendChild(t); Object.assign(t.style,{position:'fixed',right:'20px',bottom:'20px',background:'rgba(0,0,0,0.7)',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:9999});}
    t.textContent = text;
    t.style.opacity = 1;
    toastTimer = setTimeout(()=>{ t.style.transition = 'opacity .5s'; t.style.opacity = 0; }, 1400);
  }

  // Expose cart functions for order page
  window.NK = { getCart, saveCart, addItem, renderCartCount };

  // render count on load
  document.addEventListener('DOMContentLoaded', renderCartCount);
})();

