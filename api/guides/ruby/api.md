---
title: "Ruby API Development"
subTitle: "Building APIs with Rails and Sinatra"
excerpt: "Ruby makes API development a joy with its elegant syntax."
featureImage: "/img/ruby-api.png"
date: "2026-02-01"
order: 64
---

# Explanation

## Ruby API Frameworks

Ruby offers excellent frameworks for building APIs. Rails API mode provides a full-featured solution, while Sinatra offers lightweight simplicity.

### Framework Comparison

| Feature | Rails API | Sinatra | Grape |
|---------|-----------|---------|-------|
| Learning Curve | Moderate | Low | Low |
| Features | Full-stack | Minimal | API-focused |
| Performance | Good | Fast | Fast |
| Best For | Large apps | Small apps | API-only |

---

# Demonstration

## Example 1: Rails API Basics

```ruby
# Create Rails API app
# rails new api_app --api

# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users
      resources :posts do
        resources :comments, only: [:index, :create]
      end
    end
  end
end

# app/controllers/api/v1/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :update, :destroy]

      # GET /api/v1/users
      def index
        @users = User.all
        render json: { data: @users, meta: pagination_meta }
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

      def pagination_meta
        {
          page: params[:page] || 1,
          per_page: params[:per_page] || 25,
          total: User.count
        }
      end
    end
  end
end
```

## Example 2: Serialization with Active Model Serializers

```ruby
# Gemfile
gem 'active_model_serializers'

# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :created_at

  has_many :posts
  has_many :comments

  attribute :full_name do
    "#{object.first_name} #{object.last_name}"
  end

  # Conditional attributes
  attribute :admin_notes, if: :admin?

  def admin?
    scope&.admin?
  end

  # Custom links
  link(:self) { api_v1_user_url(object) }
end

# app/serializers/post_serializer.rb
class PostSerializer < ActiveModel::Serializer
  attributes :id, :title, :body, :published_at

  belongs_to :author, serializer: UserSerializer
  has_many :comments
  has_many :tags

  attribute :excerpt do
    object.body.truncate(150)
  end

  attribute :reading_time do
    (object.body.split.size / 200.0).ceil
  end
end

# Controller usage
class PostsController < ApplicationController
  def index
    posts = Post.includes(:author, :tags).page(params[:page])

    render json: posts,
           each_serializer: PostSerializer,
           include: ['author', 'tags'],
           meta: { total: Post.count }
  end

  def show
    post = Post.find(params[:id])
    render json: post, include: ['author', 'comments.author']
  end
end

# Using Blueprinter (alternative)
# Gemfile: gem 'blueprinter'

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :email

  view :extended do
    fields :created_at, :updated_at
    association :posts, blueprint: PostBlueprint
  end
end

# Usage
UserBlueprint.render(user)
UserBlueprint.render(user, view: :extended)
UserBlueprint.render_as_hash(users)
```

## Example 3: Authentication with JWT

```ruby
# Gemfile
gem 'jwt'
gem 'bcrypt'

# lib/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, algorithm: 'HS256')
    HashWithIndifferentAccess.new(decoded[0])
  rescue JWT::DecodeError, JWT::ExpiredSignature => e
    nil
  end
end

# app/controllers/concerns/authenticatable.rb
module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request
    attr_reader :current_user
  end

  private

  def authenticate_request
    token = extract_token
    return render_unauthorized unless token

    decoded = JsonWebToken.decode(token)
    return render_unauthorized unless decoded

    @current_user = User.find_by(id: decoded[:user_id])
    render_unauthorized unless @current_user
  end

  def extract_token
    header = request.headers['Authorization']
    header&.split(' ')&.last
  end

  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end

# app/controllers/auth_controller.rb
class AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:login, :register]

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: UserSerializer.new(user)
      }
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def register
    user = User.new(user_params)

    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: { token: token, user: user }, status: :created
    else
      render json: { errors: user.errors }, status: :unprocessable_entity
    end
  end

  def refresh
    token = JsonWebToken.encode(user_id: current_user.id)
    render json: { token: token }
  end

  private

  def user_params
    params.permit(:name, :email, :password, :password_confirmation)
  end
end
```

## Example 4: Sinatra API

```ruby
# Gemfile
source 'https://rubygems.org'

gem 'sinatra'
gem 'sinatra-contrib'
gem 'puma'
gem 'json'
gem 'sequel'
gem 'pg'

# app.rb
require 'sinatra/base'
require 'sinatra/json'
require 'sequel'

class Api < Sinatra::Base
  helpers Sinatra::JSON

  configure do
    set :database, Sequel.connect(ENV['DATABASE_URL'])
  end

  before do
    content_type :json
  end

  # Error handling
  error Sequel::NoMatchingRow do
    status 404
    json error: 'Resource not found'
  end

  error do
    status 500
    json error: 'Internal server error'
  end

  # Routes
  get '/api/users' do
    users = settings.database[:users].all
    json data: users
  end

  get '/api/users/:id' do
    user = settings.database[:users].where(id: params[:id]).first!
    json data: user
  end

  post '/api/users' do
    data = JSON.parse(request.body.read)

    id = settings.database[:users].insert(
      name: data['name'],
      email: data['email'],
      created_at: Time.now
    )

    user = settings.database[:users].where(id: id).first

    status 201
    json data: user
  end

  put '/api/users/:id' do
    data = JSON.parse(request.body.read)

    settings.database[:users]
      .where(id: params[:id])
      .update(name: data['name'], email: data['email'])

    user = settings.database[:users].where(id: params[:id]).first!
    json data: user
  end

  delete '/api/users/:id' do
    settings.database[:users].where(id: params[:id]).delete
    status 204
  end
end

# config.ru
require './app'
run Api

# With modular structure
# routes/users.rb
class UsersRoutes < Sinatra::Base
  helpers Sinatra::JSON

  get '/api/users' do
    json data: User.all
  end

  # ... more routes
end

# app.rb
class Api < Sinatra::Base
  use UsersRoutes
  use PostsRoutes
end
```

## Example 5: Grape API Framework

```ruby
# Gemfile
gem 'grape'
gem 'grape-entity'

# app/api/v1/base.rb
module V1
  class Base < Grape::API
    version 'v1', using: :path
    format :json
    prefix :api

    # Error handling
    rescue_from ActiveRecord::RecordNotFound do |e|
      error!({ error: 'Not found' }, 404)
    end

    rescue_from Grape::Exceptions::ValidationErrors do |e|
      error!({ errors: e.full_messages }, 400)
    end

    # Authentication helper
    helpers do
      def current_user
        @current_user ||= authenticate!
      end

      def authenticate!
        token = headers['Authorization']&.split(' ')&.last
        return nil unless token

        decoded = JsonWebToken.decode(token)
        User.find_by(id: decoded[:user_id]) if decoded
      end

      def authenticate_user!
        error!('Unauthorized', 401) unless current_user
      end
    end

    mount V1::Users
    mount V1::Posts
  end
end

# app/api/v1/users.rb
module V1
  class Users < Grape::API
    resource :users do
      desc 'Get all users'
      params do
        optional :page, type: Integer, default: 1
        optional :per_page, type: Integer, default: 25, values: 1..100
      end
      get do
        users = User.page(params[:page]).per(params[:per_page])
        present users, with: Entities::User
      end

      desc 'Get a user'
      params do
        requires :id, type: Integer
      end
      get ':id' do
        user = User.find(params[:id])
        present user, with: Entities::User
      end

      desc 'Create a user'
      params do
        requires :name, type: String
        requires :email, type: String
        optional :role, type: String, default: 'user'
      end
      post do
        user = User.create!(declared(params))
        present user, with: Entities::User
      end

      desc 'Update a user'
      params do
        requires :id, type: Integer
        optional :name, type: String
        optional :email, type: String
      end
      put ':id' do
        user = User.find(params[:id])
        user.update!(declared(params, include_missing: false))
        present user, with: Entities::User
      end

      desc 'Delete a user'
      delete ':id' do
        User.find(params[:id]).destroy
        status 204
      end
    end
  end
end

# app/api/entities/user.rb
module Entities
  class User < Grape::Entity
    expose :id
    expose :name
    expose :email
    expose :created_at, format_with: :iso_timestamp

    format_with(:iso_timestamp) { |dt| dt.iso8601 }

    expose :posts, using: Entities::Post, if: :include_posts
  end
end
```

## Example 6: Testing APIs

```ruby
# spec/requests/users_spec.rb
require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/users' do
    before { create_list(:user, 10) }

    it 'returns all users' do
      get '/api/v1/users', headers: headers

      expect(response).to have_http_status(:ok)
      expect(json['data'].size).to eq(11)
    end

    it 'supports pagination' do
      get '/api/v1/users', params: { page: 1, per_page: 5 }, headers: headers

      expect(json['data'].size).to eq(5)
      expect(json['meta']['page']).to eq(1)
    end
  end

  describe 'POST /api/v1/users' do
    let(:valid_params) do
      { user: { name: 'Test', email: 'test@example.com' } }
    end

    it 'creates a user' do
      expect {
        post '/api/v1/users', params: valid_params, headers: headers
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json['data']['name']).to eq('Test')
    end

    it 'returns errors for invalid data' do
      post '/api/v1/users',
           params: { user: { name: '' } },
           headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json['errors']).to be_present
    end
  end

  private

  def json
    JSON.parse(response.body)
  end
end

# spec/support/request_helpers.rb
module RequestHelpers
  def json_response
    JSON.parse(response.body)
  end

  def auth_headers(user)
    token = JsonWebToken.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end
```

**Key Takeaways:**
- Rails API mode for full-featured APIs
- Sinatra for lightweight services
- Grape for dedicated API projects
- Use serializers for consistent responses
- JWT for stateless authentication

---

# Imitation

### Challenge 1: Build a RESTful API

**Task:** Create a complete CRUD API for a blog with posts and comments.

<details>
<summary>Solution</summary>

```ruby
# app/controllers/api/v1/posts_controller.rb
module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_post, only: [:show, :update, :destroy]
      before_action :authorize_post, only: [:update, :destroy]

      def index
        posts = Post.includes(:author, :tags)
                    .published
                    .order(created_at: :desc)
                    .page(params[:page])

        render json: {
          data: posts.map { |p| PostSerializer.new(p) },
          meta: {
            page: posts.current_page,
            total_pages: posts.total_pages,
            total_count: posts.total_count
          }
        }
      end

      def show
        render json: { data: PostSerializer.new(@post, include: [:comments]) }
      end

      def create
        post = current_user.posts.build(post_params)

        if post.save
          render json: { data: PostSerializer.new(post) }, status: :created
        else
          render json: { errors: post.errors }, status: :unprocessable_entity
        end
      end

      def update
        if @post.update(post_params)
          render json: { data: PostSerializer.new(@post) }
        else
          render json: { errors: @post.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        @post.destroy
        head :no_content
      end

      private

      def set_post
        @post = Post.find(params[:id])
      end

      def authorize_post
        unless @post.author == current_user || current_user.admin?
          render json: { error: 'Forbidden' }, status: :forbidden
        end
      end

      def post_params
        params.require(:post).permit(:title, :body, :published, tag_ids: [])
      end
    end
  end
end
```

</details>

---

# Practice

### Exercise 1: Rate Limiting
**Difficulty:** Intermediate

Implement rate limiting middleware:
- Track requests per IP
- Return 429 when exceeded
- Include rate limit headers

### Exercise 2: API Versioning
**Difficulty:** Advanced

Build a versioning system:
- Support header-based versioning
- Maintain backward compatibility
- Deprecation warnings

---

## Summary

**What you learned:**
- Rails API development
- Sinatra and Grape frameworks
- JWT authentication
- Serialization patterns
- API testing

**Next Steps:**
- Read: [Ruby OOP](/api/guides/ruby/oop)
- Practice: Add caching to your API
- Explore: GraphQL with Ruby

---

## Resources

- [Rails API Guide](https://guides.rubyonrails.org/api_app.html)
- [Grape Documentation](https://github.com/ruby-grape/grape)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
