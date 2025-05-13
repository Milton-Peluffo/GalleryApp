package io.ionic.starter;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import android.widget.RemoteViews;
import android.os.Bundle;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.AppWidgetTarget;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ImageWidgetProvider extends AppWidgetProvider {

    private static final String TAG = "ImageWidgetProvider";
    private static final String PREFS_NAME = "CapacitorStorage"; // Default @capacitor/preferences name
    private static final String GALLERY_ITEMS_KEY = "gallery_items"; // **IMPORTANTE: Ajusta esta clave si es diferente**
    private static int currentIndex = -1; // Para rastrear la imagen actual

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate triggered");
        // Actualizar todos los widgets activos
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(TAG, "Updating widget ID: " + appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.image_widget_layout);

        List<GalleryItem> galleryItems = getGalleryItems(context);

        if (galleryItems != null && !galleryItems.isEmpty()) {
            // Seleccionar la siguiente imagen (o una aleatoria si prefieres)
            // Aquí usamos un índice secuencial que se reinicia
            currentIndex++;
            if (currentIndex >= galleryItems.size()) {
                currentIndex = 0;
            }

            GalleryItem currentItem = galleryItems.get(currentIndex);
            Log.d(TAG, "Displaying item index: " + currentIndex + " URL: " + currentItem.imageUrl);

            // Actualizar descripción
            views.setTextViewText(R.id.widget_description, currentItem.description);

            // Cargar imagen usando Glide
            AppWidgetTarget appWidgetTarget = new AppWidgetTarget(context, R.id.widget_image, views, appWidgetId);
            Glide.with(context.getApplicationContext())
                 .asBitmap()
                 .load(currentItem.imageUrl)
                 .override(300, 300) // Ajusta el tamaño según sea necesario
                 .centerCrop()
                 .into(appWidgetTarget);

        } else {
            Log.d(TAG, "No gallery items found or error reading preferences.");
            // Mostrar estado por defecto o mensaje de error
            views.setTextViewText(R.id.widget_description, "No hay imágenes");
            views.setImageViewResource(R.id.widget_image, R.mipmap.ic_launcher); // Imagen por defecto
        }

        // // Opcional: Añadir un intent para abrir la app al hacer clic en el widget
        // Intent intent = new Intent(context, MainActivity.class);
        // PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        // Indicar al AppWidgetManager que actualice el widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static List<GalleryItem> getGalleryItems(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonString = prefs.getString(GALLERY_ITEMS_KEY, null);
        Log.d(TAG, "Read from SharedPreferences (" + GALLERY_ITEMS_KEY + "): " + jsonString);

        if (jsonString == null) {
            return null;
        }

        List<GalleryItem> items = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(jsonString);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                String imageUrl = jsonObject.optString("imageUrl", null);
                String description = jsonObject.optString("description", "");
                if (imageUrl != null) { // Solo añadir si la URL no es nula
                     items.add(new GalleryItem(imageUrl, description));
                }
            }
            Log.d(TAG, "Parsed " + items.size() + " items.");
            return items;
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing JSON from SharedPreferences", e);
            return null;
        }
    }

    // Clase auxiliar para guardar los datos
    static class GalleryItem {
        String imageUrl;
        String description;

        GalleryItem(String imageUrl, String description) {
            this.imageUrl = imageUrl;
            this.description = description;
        }
    }

    // Opcional: Manejar la eliminación del widget si necesitas limpiar algo
    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        Log.d(TAG, "onDeleted");
        // Aquí podrías limpiar recursos si fuera necesario
    }

    // Opcional: Manejar la primera creación del widget
    @Override
    public void onEnabled(Context context) {
        Log.d(TAG, "onEnabled: Widget created for the first time");
        // Podrías iniciar alguna configuración inicial si es necesario
    }

    // Opcional: Manejar cuando el último widget es eliminado
    @Override
    public void onDisabled(Context context) {
        Log.d(TAG, "onDisabled: Last widget instance deleted");
        // Podrías detener servicios o tareas en segundo plano
    }
}
