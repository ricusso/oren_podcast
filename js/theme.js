// Universal Theme Management and Mobile Menu
document.addEventListener('DOMContentLoaded', function() {
  console.log('Theme.js loaded');
  
  // Theme Management
  const themeToggle = document.querySelectorAll('.theme-toggle');
  const html = document.documentElement;
  const body = document.body;
  
  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  body.setAttribute('data-theme', currentTheme);
  
  // Update icon based on current theme
  function updateThemeIcon() {
    const icons = document.querySelectorAll('.theme-toggle i');
    icons.forEach(icon => {
      if (html.getAttribute('data-theme') === 'dark') {
        icon.className = 'ti ti-sun';
      } else {
        icon.className = 'ti ti-moon';
      }
    });
  }
  
  // Initialize theme icons
  updateThemeIcon();
  
  // Add click event listeners to all theme toggle buttons
  themeToggle.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon();
      
      // Add smooth transition effect
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      setTimeout(() => {
        body.style.transition = '';
      }, 300);
    });
  });

  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  
  console.log('Mobile menu elements:', {
    btn: mobileMenuBtn,
    menu: mobileMenu,
    overlay: mobileMenuOverlay
  });
  
  if (mobileMenuBtn && mobileMenu && mobileMenuOverlay) {
    console.log('Mobile menu elements found, adding event listeners');
    
    function toggleMobileMenu() {
      console.log('Toggle mobile menu called');
      mobileMenu.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      
      // Update menu button icon
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileMenu.classList.contains('active')) {
        icon.className = 'ti ti-x';
      } else {
        icon.className = 'ti ti-menu-2';
      }
    }
    
    mobileMenuBtn.addEventListener('click', function(e) {
      console.log('Mobile menu button clicked');
      e.preventDefault();
      toggleMobileMenu();
    });
    
    mobileMenuOverlay.addEventListener('click', function(e) {
      console.log('Mobile menu overlay clicked');
      e.preventDefault();
      toggleMobileMenu();
    });
    
    // Close menu when clicking on links
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu .nav-link');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', toggleMobileMenu);
    });
  } else {
    console.log('Mobile menu elements not found');
  }
});

// FAQ functionality
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic form validation
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      
      if (isValid) {
        // Here you would typically send the form data to a server
        console.log('Form submitted successfully');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Сообщение отправлено успешно!';
        form.appendChild(successMessage);
        
        // Reset form
        form.reset();
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      }
    });
  });
});