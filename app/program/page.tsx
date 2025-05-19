"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Info, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type Program = {
  id: string;
  name: string;
  exam_type: string;
  exam_date: string;
  created_at: string;
  // Olası kullanıcı ID alanları
  user_id?: string;
  userId?: string;
  created_by?: string;
  createdBy?: string; 
  owner_id?: string;
  ownerId?: string;
  user?: string;
};

type AuthDebugInfo = {
  hasAuthTokenCookie: boolean;
  sessionExists: boolean;
  userExists: boolean;
  allCookieNames: string[];
  error?: boolean;
  message?: string;
};

export default function ProgramsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const router = useRouter();

  const fetchDebugInfo = async () => {
    try {
      const debugResponse = await fetch('/api/debug/auth');
      const debugData = await debugResponse.json();
      console.log('Debug API yanıtı:', debugData);
      setDebugInfo(debugData);
    } catch (error) {
      console.error('Debug bilgisi alınamadı:', error);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchPrograms = async () => {
      setIsLoading(true);
      
      try {
        // Oturum kontrolü yap
        const authResponse = await fetch('/api/auth/session');
        if (!authResponse.ok) {
          throw new Error('Oturum bilgisi alınamadı');
        }
        
        const authData = await authResponse.json();
        console.log('Oturum kontrolü yanıtı:', authData);
        
        // Debug bilgilerini al
        await fetchDebugInfo();
        
        // Kullanıcı bilgisi varsa programları getir (oturum bilgisini kontrol etmeyi kaldırıyoruz)
        if (authData.user) {
          console.log('Kullanıcı bilgisi bulundu:', authData.user);
          setIsAuthenticated(true);
          
          // Programları getir
          try {
            const programsResponse = await fetch('/api/program/user-programs', {
              method: 'GET',
              credentials: 'include', // Cookie'leri de gönder
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (!programsResponse.ok) {
              const errorData = await programsResponse.json().catch(() => ({}));
              console.error('Programlar alınamadı:', programsResponse.status, errorData);
              throw new Error(`Programlar alınamadı: ${programsResponse.status} ${errorData.error || ''}`);
            }
            
            const programsData = await programsResponse.json();
            console.log('Programlar başarıyla alındı:', programsData);
            
            if (programsData.programs && programsData.programs.length > 0) {
              const firstProgram = programsData.programs[0];
              console.log('İlk program örneği:', firstProgram);
              console.log('Program alanları:', Object.keys(firstProgram));
              
              // Olası kullanıcı ID ile ilgili olabilecek alanları kontrol et
              const userIdFields = ['user_id', 'userId', 'created_by', 'createdBy', 'owner_id', 'ownerId', 'user'];
              const foundFields = userIdFields.filter(field => Object.keys(firstProgram).includes(field));
              console.log('Bulunan olası kullanıcı ID alanları:', foundFields);
              
              if (authData.user && authData.user.id) {
                // Kullanıcıya ait programları filtrele
                const userPrograms = programsData.programs.filter((program: Program) => 
                  isUserProgram(program, authData.user.id)
                );
                console.log(`Kullanıcıya ait ${userPrograms.length} program bulundu.`);
                
                if (userPrograms.length === 0) {
                  console.log('Kullanıcı ID:', authData.user.id);
                  console.log('Programlardaki kullanıcı ID alanları:', 
                    programsData.programs.map((p: Program) => ({
                      user_id: p.user_id,
                      userId: p.userId,
                      created_by: p.created_by,
                      createdBy: p.createdBy,
                      owner_id: p.owner_id,
                      ownerId: p.ownerId,
                      user: p.user
                    }))
                  );
                }
                
                setPrograms(userPrograms);
              } else {
                setPrograms(programsData.programs || []);
              }
            } else {
              setPrograms(programsData.programs || []);
            }
          } catch (programError) {
            console.error('Programlar alınamadı:', programError);
            toast.error('Programlar yüklenirken bir hata oluştu.');
          }
        } else {
          console.log('Kullanıcı bilgisi bulunamadı:', authData);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Oturum kontrolü yapılırken hata oluştu:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndFetchPrograms();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchDebugInfo().then(() => {
      window.location.reload();
    });
  };

  // Programların belirli bir kullanıcıya ait olup olmadığını kontrol eden fonksiyon
  const isUserProgram = (program: Program, userId: string) => {
    // Olası tüm kullanıcı ID alanlarını kontrol et
    return (
      program.user_id === userId ||
      program.userId === userId ||
      program.created_by === userId ||
      program.createdBy === userId ||
      program.owner_id === userId ||
      program.ownerId === userId ||
      program.user === userId
    );
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="container max-w-5xl py-12 px-4 md:px-6 mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-8 rounded-lg w-full max-w-md flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Programlarınız yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı oturum açmamışsa
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] px-4 gap-5">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Oturum Açmanız Gerekiyor</CardTitle>
              <CardDescription>
                Programlarınızı görüntülemek için lütfen oturum açın veya kayıt olun.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <div className="flex items-start gap-3 bg-primary/10 p-3 rounded-md">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Nasıl Çalışır?</p>
                  <p className="text-muted-foreground">
                    Önce programınızı oluşturup satın alabilirsiniz. Ödeme sırasında hesap oluşturmanız için size bir seçenek sunulacaktır.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/login?redirect=program'}>
                Giriş Yap
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/register?redirect=program')}>
                Kayıt Ol
              </Button>
              <Button variant="link" className="w-full" onClick={() => router.push('/analysis')}>
                Önce Program Oluştur
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Debug Butonu */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hata Ayıklama Bilgisini Gizle" : "Hata Ayıklama Bilgisini Göster"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" /> Yenile
          </Button>
        </div>
        
        {/* Debug Bilgisi */}
        {showDebug && debugInfo && (
          <div className="w-full max-w-md">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-sm text-red-700">Hata Ayıklama Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-xs space-y-1 font-mono">
                  <p>Auth Token Cookie: {debugInfo.hasAuthTokenCookie ? '✅ Var' : '❌ Yok'}</p>
                  <p>Oturum: {debugInfo.sessionExists ? '✅ Var' : '❌ Yok'}</p>
                  <p>Kullanıcı: {debugInfo.userExists ? '✅ Var' : '❌ Yok'}</p>
                  <p>Cookie'ler: {debugInfo.allCookieNames?.join(', ') || 'Yok'}</p>
                  {debugInfo.error && <p className="text-red-500">Hata: {debugInfo.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Bu bilgi sadece geliştirme amaçlıdır. Konsolda daha fazla detay bulabilirsiniz.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Kullanıcı oturum açmış ve programları yüklenmiş durumda
  return (
    <div className="container max-w-5xl py-12 px-4 md:px-6 mx-auto">
      <div className="flex justify-between items-center mb-8 p-4 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programlarım</h1>
          <p className="text-muted-foreground">
            Çalışma programlarınızı buradan görüntüleyebilirsiniz.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/analysis')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Yeni Program
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {programs.length === 0 ? (
        <Card className="w-full max-w-3xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>Henüz Hiç Programınız Yok</CardTitle>
            <CardDescription>
              Yeni bir program oluşturarak çalışmaya başlayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex items-start gap-3 bg-primary/10 p-3 rounded-md">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Program Nasıl Oluşturulur?</p>
                <p className="text-muted-foreground">
                  Analiz formunu doldurarak size özel bir çalışma programı oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push('/analysis')}>
              Yeni Program Oluştur
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link href={`/program/${program.id}`} key={program.id} className="block">
              <Card className="h-full hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{program.name || program.exam_type}</CardTitle>
                  <CardDescription>
                    Oluşturulma: {new Date(program.created_at).toLocaleDateString('tr-TR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1">
                    Sınav Tipi: {program.exam_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sınav Tarihi: {new Date(program.exam_date).toLocaleDateString('tr-TR')}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Görüntüle
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Debug Butonu */}
      <div className="mt-10 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Hata Ayıklama Bilgisini Gizle" : "Hata Ayıklama Bilgisini Göster"}
        </Button>
      </div>
      
      {/* Debug Bilgisi */}
      {showDebug && debugInfo && (
        <div className="mt-4 max-w-lg mx-auto">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-sm text-blue-700">Hata Ayıklama Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-xs space-y-1 font-mono">
                <p>Auth Token Cookie: {debugInfo.hasAuthTokenCookie ? '✅ Var' : '❌ Yok'}</p>
                <p>Oturum: {debugInfo.sessionExists ? '✅ Var' : '❌ Yok'}</p>
                <p>Kullanıcı: {debugInfo.userExists ? '✅ Var' : '❌ Yok'}</p>
                <p>Cookie'ler: {debugInfo.allCookieNames?.join(', ') || 'Yok'}</p>
                {debugInfo.error && <p className="text-red-500">Hata: {debugInfo.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 