// Auth client — cookie-based auth against external API
'use strict';

var AuthAPI = (function() {
  var BASE = 'http://localhost:3001/api';
  var _user = null;
  var _listeners = [];

  function onAuthChange(fn) { _listeners.push(fn); }
  function _notify() { _listeners.forEach(function(fn) { fn(_user); }); }

  function request(method, path, body) {
    var opts = { method: method, credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts).then(function(r) {
      if (!r.ok) {
        return r.json().catch(function() { return {}; }).then(function(data) {
          throw new Error(data.message || data.error || 'Request failed (' + r.status + ')');
        });
      }
      return r.json().catch(function() { return {}; });
    });
  }

  function login(email, password) {
    return request('POST', '/auth/login', { email: email, password: password }).then(function(data) {
      _user = data.user || data;
      localStorage.setItem('operis-user', JSON.stringify(_user));
      _notify();
      return _user;
    });
  }

  function register(fullName, email, password) {
    return request('POST', '/auth/register', { fullName: fullName, email: email, password: password }).then(function(data) {
      _user = data.user || data;
      localStorage.setItem('operis-user', JSON.stringify(_user));
      _notify();
      return _user;
    });
  }

  function logout() {
    return request('POST', '/auth/logout').then(function() {
      _user = null;
      localStorage.removeItem('operis-user');
      _notify();
    }).catch(function() {
      _user = null;
      localStorage.removeItem('operis-user');
      _notify();
    });
  }

  function profile() {
    return request('GET', '/auth/profile').then(function(data) {
      _user = data.user || data;
      localStorage.setItem('operis-user', JSON.stringify(_user));
      _notify();
      return _user;
    });
  }

  function refresh() {
    return request('POST', '/auth/refresh');
  }

  function getUser() { return _user; }
  function isLoggedIn() { return !!_user; }

  // Restore from localStorage on load
  try {
    var saved = localStorage.getItem('operis-user');
    if (saved) _user = JSON.parse(saved);
  } catch(e) {}

  return {
    login: login,
    register: register,
    logout: logout,
    profile: profile,
    refresh: refresh,
    getUser: getUser,
    isLoggedIn: isLoggedIn,
    onAuthChange: onAuthChange
  };
})();
