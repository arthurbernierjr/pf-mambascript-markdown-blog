---
title: "Ruby Routing"
subTitle: "Building Web Applications with Rails and Sinatra"
excerpt: "Ruby on Rails changed how we build web apps."
featureImage: "/img/ruby-routing.png"
date: "2026-02-01"
order: 401
---

# Explanation

## Web Routing in Ruby

Ruby has two main web frameworks: Rails (full-featured) and Sinatra (minimal). Both excel at different things.

### Key Concepts

- **Routes**: Map URLs to controller actions
- **RESTful**: Resource-oriented routing
- **Middleware**: Request/response pipeline
- **Helpers**: URL generation methods

### Rails vs Sinatra

| Feature | Rails | Sinatra |
|---------|-------|---------|
| Philosophy | Convention over config | Minimal |
| Size | Full framework | Micro framework |
| Learning | Steeper curve | Quick start |
| Best for | Large apps | APIs, small apps |

---

# Demonstration

## Example 1: Sinatra Basics

```ruby
# app.rb
require 'sinatra'
require 'sinatra/json'

# Simple routes
get '/' do
  'Hello, World!'
end

# JSON response
get '/api/status' do
  json status: 'ok', time: Time.now
end

# Route parameters
get '/users/:id' do
  user_id = params[:id]
  json id: user_id, name: "User #{user_id}"
end

# Multiple parameters
get '/posts/:year/:month/:day' do
  json(
    year: params[:year],
    month: params[:month],
    day: params[:day]
  )
end

# Query parameters
get '/search' do
  query = params[:q] || '*'
  limit = params[:limit]&.to_i || 10

  json query: query, limit: limit
end

# POST with JSON body
post '/users' do
  data = JSON.parse(request.body.read)

  unless data['name'] && data['email']
    halt 400, json(error: 'Name and email required')
  end

  user = { id: rand(1000), name: data['name'], email: data['email'] }
  status 201
  json user
end

# PUT update
put '/users/:id' do
  user_id = params[:id]
  data = JSON.parse(request.body.read)

  json id: user_id, **data
end

# DELETE
delete '/users/:id' do
  status 204
end

# Before filter (middleware)
before do
  content_type :json
end

# Error handling
error 404 do
  json error: 'Not found'
end

error 500 do
  json error: 'Internal server error'
end
```

## Example 2: Sinatra Modular Style

```ruby
# app.rb
require 'sinatra/base'
require 'sinatra/json'

class UserAPI < Sinatra::Base
  helpers Sinatra::JSON

  configure do
    set :users, {}
    set :next_id, 1
  end

  before do
    content_type :json
  end

  # Authentication middleware
  before '/api/*' do
    auth = request.env['HTTP_AUTHORIZATION']
    halt 401, json(error: 'Unauthorized') unless auth == 'Bearer secret'
  end

  get '/api/users' do
    json data: settings.users.values
  end

  get '/api/users/:id' do
    user = settings.users[params[:id].to_i]
    halt 404, json(error: 'Not found') unless user
    json data: user
  end

  post '/api/users' do
    data = JSON.parse(request.body.read)

    user = {
      id: settings.next_id,
      name: data['name'],
      email: data['email'],
      created_at: Time.now.iso8601
    }

    settings.users[user[:id]] = user
    settings.next_id += 1

    status 201
    json data: user
  end

  delete '/api/users/:id' do
    id = params[:id].to_i
    halt 404, json(error: 'Not found') unless settings.users.key?(id)

    settings.users.delete(id)
    status 204
  end
end

# Run with: ruby app.rb
UserAPI.run! if __FILE__ == $0
```

## Example 3: Rails Routes

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Root route
  root 'home#index'

  # Basic routes
  get 'about', to: 'pages#about'
  get 'contact', to: 'pages#contact'

  # RESTful resources
  resources :users do
    # Nested resources
    resources :posts, only: [:index, :create]
  end

  # Generates:
  # GET    /users          users#index
  # GET    /users/new      users#new
  # POST   /users          users#create
  # GET    /users/:id      users#show
  # GET    /users/:id/edit users#edit
  # PATCH  /users/:id      users#update
  # DELETE /users/:id      users#destroy
  # GET    /users/:user_id/posts     posts#index
  # POST   /users/:user_id/posts     posts#create

  # API namespace
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create, :update, :destroy]
      resources :posts do
        resources :comments, shallow: true
      end
    end
  end

  # Custom routes
  get 'users/:id/profile', to: 'users#profile', as: :user_profile
  post 'users/:id/activate', to: 'users#activate'

  # Member and collection routes
  resources :articles do
    member do
      post :publish
      post :archive
    end
    collection do
      get :search
      get :drafts
    end
  end

  # Constraints
  constraints(id: /\d+/) do
    resources :products
  end

  # Subdomain routing
  constraints subdomain: 'api' do
    scope module: 'api' do
      resources :users
    end
  end
end
```

## Example 4: Rails Controllers

```ruby
# app/controllers/api/v1/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :update, :destroy]
      before_action :authenticate_request

      # GET /api/v1/users
      def index
        @users = User.all

        # Pagination
        @users = @users.page(params[:page]).per(params[:per_page] || 10)

        # Filtering
        @users = @users.where(role: params[:role]) if params[:role]

        render json: {
          data: @users,
          meta: {
            page: @users.current_page,
            total: @users.total_count,
            total_pages: @users.total_pages
          }
        }
      end

      # GET /api/v1/users/:id
      def show
        render json: { data: @user }
      end

      # POST /api/v1/users
      def create
        @user = User.new(user_params)

        if @user.save
          render json: { data: @user }, status: :created
        else
          render json: { errors: @user.errors }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/users/:id
      def update
        if @user.update(user_params)
          render json: { data: @user }
        else
          render json: { errors: @user.errors }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        @user.destroy
        head :no_content
      end

      private

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      def user_params
        params.require(:user).permit(:name, :email, :role)
      end

      def authenticate_request
        token = request.headers['Authorization']&.split(' ')&.last
        render json: { error: 'Unauthorized' }, status: :unauthorized unless valid_token?(token)
      end

      def valid_token?(token)
        # Token validation logic
        token == 'valid-token'
      end
    end
  end
end
```

## Example 5: Middleware and Filters

```ruby
# Sinatra middleware
class AuthMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)

    # Skip auth for public routes
    if public_route?(request.path)
      return @app.call(env)
    end

    token = env['HTTP_AUTHORIZATION']&.split(' ')&.last

    unless valid_token?(token)
      return [401, { 'Content-Type' => 'application/json' },
              ['{"error":"Unauthorized"}']]
    end

    # Add user to request
    env['current_user'] = decode_token(token)

    @app.call(env)
  end

  private

  def public_route?(path)
    ['/health', '/login', '/register'].include?(path)
  end

  def valid_token?(token)
    token && token.length > 10
  end

  def decode_token(token)
    { id: 1, email: 'user@example.com' }
  end
end

# Use in Sinatra
class App < Sinatra::Base
  use AuthMiddleware

  get '/profile' do
    user = request.env['current_user']
    json user: user
  end
end

# Rails concerns (shared behavior)
# app/controllers/concerns/pagination.rb
module Pagination
  extend ActiveSupport::Concern

  def paginate(collection)
    page = params[:page] || 1
    per_page = params[:per_page] || 10

    collection.page(page).per(per_page)
  end

  def pagination_meta(collection)
    {
      page: collection.current_page,
      per_page: collection.limit_value,
      total: collection.total_count,
      total_pages: collection.total_pages
    }
  end
end

# Use in controller
class PostsController < ApplicationController
  include Pagination

  def index
    @posts = paginate(Post.published)
    render json: { data: @posts, meta: pagination_meta(@posts) }
  end
end
```

**Key Takeaways:**
- Sinatra is great for small apps and APIs
- Rails provides powerful conventions
- RESTful routes map to CRUD operations
- Use namespaces for API versioning
- Middleware handles cross-cutting concerns

---

# Imitation

### Challenge 1: Add Search Route

**Task:** Add a search endpoint with multiple filters.

<details>
<summary>Solution</summary>

```ruby
# Sinatra
get '/api/users/search' do
  users = settings.users.values

  # Filter by name
  if params[:name]
    users = users.select { |u| u[:name].downcase.include?(params[:name].downcase) }
  end

  # Filter by role
  if params[:role]
    users = users.select { |u| u[:role] == params[:role] }
  end

  # Sort
  if params[:sort]
    field = params[:sort].to_sym
    users = users.sort_by { |u| u[field] || '' }
    users = users.reverse if params[:order] == 'desc'
  end

  # Pagination
  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 10).to_i
  offset = (page - 1) * per_page

  json(
    data: users[offset, per_page],
    meta: {
      page: page,
      per_page: per_page,
      total: users.length
    }
  )
end
```

</details>

### Challenge 2: Rate Limiting Middleware

**Task:** Implement rate limiting for API endpoints.

<details>
<summary>Solution</summary>

```ruby
class RateLimiter
  def initialize(app, options = {})
    @app = app
    @limit = options[:limit] || 100
    @window = options[:window] || 3600  # 1 hour
    @requests = {}
  end

  def call(env)
    ip = env['REMOTE_ADDR']
    now = Time.now.to_i

    clean_old_requests(ip, now)

    if rate_limited?(ip)
      return [429, {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after(ip, now).to_s
      }, ['{"error":"Rate limit exceeded"}']]
    end

    record_request(ip, now)

    status, headers, body = @app.call(env)

    # Add rate limit headers
    headers['X-RateLimit-Limit'] = @limit.to_s
    headers['X-RateLimit-Remaining'] = remaining(ip).to_s

    [status, headers, body]
  end

  private

  def clean_old_requests(ip, now)
    return unless @requests[ip]
    @requests[ip] = @requests[ip].select { |t| now - t < @window }
  end

  def rate_limited?(ip)
    @requests[ip]&.length.to_i >= @limit
  end

  def record_request(ip, now)
    @requests[ip] ||= []
    @requests[ip] << now
  end

  def remaining(ip)
    @limit - @requests[ip]&.length.to_i
  end

  def retry_after(ip, now)
    oldest = @requests[ip]&.first || now
    @window - (now - oldest)
  end
end

# Usage
use RateLimiter, limit: 100, window: 3600
```

</details>

---

# Practice

### Exercise 1: Blog API
**Difficulty:** Intermediate

Build a blog API with:
- Posts CRUD
- Categories and tags
- Search with filters
- Pagination

### Exercise 2: Authentication System
**Difficulty:** Advanced

Implement authentication:
- User registration
- Login with JWT
- Password reset
- Role-based access

---

## Summary

**What you learned:**
- Sinatra for minimal web apps
- Rails routing conventions
- RESTful resource routing
- Middleware patterns
- Controller organization

**Next Steps:**
- Read: [Ruby OOP](/api/guides/ruby/oop)
- Practice: Build a REST API
- Explore: Rails Active Record

---

## Resources

- [Sinatra Documentation](http://sinatrarb.com/documentation.html)
- [Rails Routing Guide](https://guides.rubyonrails.org/routing.html)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
