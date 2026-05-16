<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { MapPin, Briefcase, Share2, ArrowLeft, Mail, MessageCircle, Smartphone, Linkedin, Link2, Check } from 'lucide-vue-next';
import Button from '../components/Button.vue';
import { jobs } from '../data/jobs';

const route = useRoute();
const job = computed(() => jobs.find(j => j.slug === route.params.slug));

const isShareOpen = ref(false);
const copied = ref(false);

const toggleShare = () => {
  isShareOpen.value = !isShareOpen.value;
};

const closeShare = (e) => {
  if (isShareOpen.value && !e.target.closest('.share-container')) {
    isShareOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeShare);
});

onUnmounted(() => {
  document.removeEventListener('click', closeShare);
});

const shareJob = (method) => {
  const url = window.location.href;
  const text = `Check out this ${job.value.title} position:`;
  
  switch (method) {
    case 'email':
      window.location.href = `mailto:?subject=${encodeURIComponent(job.value.title)}&body=${encodeURIComponent(text + ' ' + url)}`;
      break;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      break;
    case 'sms':
      window.location.href = `sms:?body=${encodeURIComponent(text + ' ' + url)}`;
      break;
    case 'linkedin':
      window.open(`https://www.linkedin.com/messaging/compose?body=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      break;
    case 'copy':
      navigator.clipboard.writeText(url).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
      });
      break;
  }
  if (method !== 'copy') isShareOpen.value = false;
};

</script>

<template>
  <div v-if="job" class="bg-white min-vh-100">
    <!-- Breadcrumb / Nav -->
    <div class="border-bottom sticky-top bg-white" style="top: 56px; z-index: 900;">
      <div class="container py-3 d-flex justify-content-between align-items-center mobile-container stats-container position-relative">
        <RouterLink to="/careers" class="d-flex align-items-center text-secondary small fw-medium text-decoration-none">
          <ArrowLeft :size="16" class="me-1" />
          {{ $t('careers.back_all') }}
        </RouterLink>
        <div class="d-flex gap-2 align-items-center">
           <div class="share-container position-relative">
             <Button variant="outline" size="sm" class="d-none d-sm-inline-flex" @click.stop="toggleShare">
               <Share2 :size="16" class="me-2"/> {{ $t('careers.share') }}
             </Button>
             <!-- Share Dropdown -->
             <div v-if="isShareOpen" class="position-absolute top-100 end-0 mt-2 bg-white border rounded-3 shadow-sm p-2 z-3" style="min-width: 200px;">
               <button @click="shareJob('email')" class="dropdown-item d-flex align-items-center gap-2 w-100 text-start btn btn-link text-decoration-none text-dark p-2 rounded-2 hover-bg-light">
                 <Mail :size="16" /> {{ $t('careers.share_email') }}
               </button>
               <button @click="shareJob('whatsapp')" class="dropdown-item d-flex align-items-center gap-2 w-100 text-start btn btn-link text-decoration-none text-dark p-2 rounded-2 hover-bg-light">
                 <MessageCircle :size="16" /> {{ $t('careers.share_whatsapp') }}
               </button>
               <button @click="shareJob('sms')" class="dropdown-item d-flex align-items-center gap-2 w-100 text-start btn btn-link text-decoration-none text-dark p-2 rounded-2 hover-bg-light">
                 <Smartphone :size="16" /> {{ $t('careers.share_sms') }}
               </button>
               <button @click="shareJob('linkedin')" class="dropdown-item d-flex align-items-center gap-2 w-100 text-start btn btn-link text-decoration-none text-dark p-2 rounded-2 hover-bg-light">
                 <Linkedin :size="16" /> {{ $t('careers.share_linkedin') }}
               </button>
               <div class="dropdown-divider border-top my-1"></div>
               <button @click="shareJob('copy')" class="dropdown-item d-flex align-items-center gap-2 w-100 text-start btn btn-link text-decoration-none text-dark p-2 rounded-2 hover-bg-light">
                 <component :is="copied ? Check : Link2" :size="16" :class="copied ? 'text-success' : ''" /> 
                 {{ copied ? $t('careers.copied') : $t('careers.copy_link') }}
               </button>
             </div>
           </div>
           <RouterLink :to="`/careers/jobs/apply/${job.slug}`">
             <Button variant="primary" size="sm">{{ $t('careers.apply') }}</Button>
           </RouterLink>
        </div>
      </div>
    </div>

    <div class="container py-5 mobile-container stats-container position-relative">
      <!-- Header -->
      <div class="mb-5">
        <h1 class="display-5 text-dark mb-3">{{ job.title }}</h1>
        <div class="d-flex flex-wrap gap-3 text-secondary small">
          <div class="d-flex align-items-center gap-2 text-secondary small">
            <MapPin :size="16" />
            <span>{{ job.location }}</span>
          </div>
          <span class="d-flex align-items-center gap-1">
            <Briefcase :size="16" /> {{ job.team }}
          </span>
          <span class="badge bg-light text-dark border fw-medium px-2">
            {{ job.type }}
          </span>
        </div>
      </div>

      <div class="row g-5">
        <!-- Main Content -->
        <div class="col-lg-8">
          <div class="d-flex flex-column gap-5 text-secondary">
            
            <section>
              <h2 class="h5 fw-bold text-dark mb-3">{{ $t('careers.about_job') }}</h2>
              <div v-for="(paragraph, index) in job.about" :key="index">
                  <p :class="{ 'mt-3': index > 0 }">{{ paragraph }}</p>
              </div>
            </section>

            <section>
              <h2 class="h5 fw-bold text-dark mb-3">{{ $t('careers.responsibilities') }}</h2>
              <ul class="ps-3 mb-0">
                <li v-for="(item, index) in job.responsibilities" :key="index" :class="{ 'mb-2': index < job.responsibilities.length - 1 }">{{ item }}</li>
              </ul>
            </section>

            <section>
              <h2 class="h5 fw-bold text-dark mb-3">{{ $t('careers.min_qual') }}</h2>
              <ul class="ps-3 mb-0">
                 <li v-for="(item, index) in job.minimumQualifications" :key="index" :class="{ 'mb-2': index < job.minimumQualifications.length - 1 }">{{ item }}</li>
              </ul>
            </section>

            <section>
              <h2 class="h5 fw-bold text-dark mb-3">{{ $t('careers.pref_qual') }}</h2>
              <ul class="ps-3 mb-0">
                  <li v-for="(item, index) in job.preferredQualifications" :key="index" :class="{ 'mb-2': index < job.preferredQualifications.length - 1 }">{{ item }}</li>
              </ul>
            </section>

             <div class="pt-4 border-top mt-2">
               <p class="small text-muted mb-0 px-1">
                 {{ $t('careers.eoe') }}
               </p>
             </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="bg-light p-4 rounded-4 sticky-top" style="top: 140px;">
            <h3 class="h5 fw-bold text-dark mb-3">{{ $t('careers.join_title') }}</h3>
            <p class="small text-secondary mb-4">
              {{ $t('careers.join_desc') }}
            </p>
            <RouterLink :to="`/careers/jobs/apply/${job.slug}`">
              <Button class="w-100 mb-2">{{ $t('careers.apply_this') }}</Button>
            </RouterLink>
            <Button variant="outline" class="w-100">{{ $t('careers.save_later') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container py-5 text-center">
      <h2 class="display-6 text-dark">{{ $t('careers.not_found') }}</h2>
      <RouterLink to="/careers" class="btn btn-primary mt-3">{{ $t('careers.back_careers') }}</RouterLink>
  </div>
</template>

<style scoped>
.rounded-4 { border-radius: 1rem !important; }
.hover-bg-light:hover { background-color: #f8fafc; }
.dropdown-item { font-size: 0.9rem; }
</style>
