require 'rails_helper'

RSpec.describe BrandsController, type: :controller do
  render_views

  let!(:brand) { create(:brand) }

  describe 'GET #index' do
    let!(:brands) { create_list(:brand, 3) }

    it 'returns all brands' do
      get :index, format: :json

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json.length).to eq(4)
    end
  end

  describe 'GET #show' do
    it 'returns the requested brand' do
      get :show, params: { id: brand.id }, format: :json

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json['id']).to eq(brand.id)
      expect(json['name']).to eq(brand.name)
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      {
        brand: {
          name: 'Urban Minimal',
          slug: 'urban-minimal'
        }
      }
    end

    it 'creates a new brand' do
      expect {
        post :create, params: valid_params, format: :json
      }.to change(Brand, :count).by(1)
    end

    it 'returns created status' do
      post :create, params: valid_params, format: :json

      expect(response).to have_http_status(:created)
    end

    it 'returns the created brand' do
      post :create, params: valid_params, format: :json

      json = JSON.parse(response.body)

      expect(json['name']).to eq('Urban Minimal')
      expect(json['slug']).to eq('urban-minimal')
    end
  end

  describe 'PATCH #update' do
    let(:update_params) do
      {
        id: brand.id,
        brand: {
          name: 'Updated Brand'
        }
      }
    end

    it 'updates the brand' do
      patch :update, params: update_params, format: :json

      expect(response).to have_http_status(:ok)

      brand.reload

      expect(brand.name).to eq('Updated Brand')
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes the brand' do
      expect {
        delete :destroy, params: { id: brand.id }, format: :json
      }.to change(Brand, :count).by(-1)
    end

    it 'returns no content status' do
      delete :destroy, params: { id: brand.id }, format: :json

      expect(response).to have_http_status(:no_content)
    end
  end
end